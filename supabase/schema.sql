-- ==========================================================
-- Lucky 7 游戏大厅全套数据库架构设计与初始化脚本
-- 在 Supabase Dashboard -> SQL Editor 中直接粘贴并执行
-- ==========================================================

-- 1. 启用 uuid 扩展
create extension if not exists "uuid-ossp";

-- 2. 用户公开信息表 (profiles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nickname text default '玩家',
  avatar_url text default '',
  chips bigint not null default 10000,
  is_admin boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. 每日签到记录表 (daily_checkins)
create table if not exists public.daily_checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  checkin_date date not null default current_date,
  reward_chips int not null default 1000,
  streak_days int not null default 1,
  created_at timestamptz default now(),
  constraint unique_user_daily_checkin unique (user_id, checkin_date)
);

-- 4. 筹码流水明细表 (chip_transactions)
create table if not exists public.chip_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount bigint not null,
  type text not null, -- 'register_bonus', 'daily_checkin', 'game_win', 'game_loss', 'admin_grant', 'admin_deduct'
  balance_after bigint not null,
  note text default '',
  created_at timestamptz default now()
);

-- 5. 游戏历史战绩表 (game_records)
create table if not exists public.game_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  game_type text not null, -- 'zhajinhua', 'blackjack', 'texas', 'sicbo', 'marksix'
  room_id uuid,
  bet_amount bigint not null,
  payout bigint not null,
  net_profit bigint not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 6. 联机游戏房间表 (game_rooms) - 全数据库行驱动
create table if not exists public.game_rooms (
  id uuid default gen_random_uuid() primary key,
  game_type text not null,
  name text not null,
  min_bet bigint not null default 50,
  max_players int not null default 6,
  status text not null default 'waiting', -- 'waiting', 'playing', 'settling'
  host_id uuid references public.profiles(id) on delete set null,
  round_state jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. 房间座位/在桌玩家表 (room_players)
create table if not exists public.room_players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.game_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  seat int not null,
  chips bigint not null default 0,
  status text not null default 'ready', -- 'ready', 'playing', 'folded', 'waiting'
  hand jsonb default '[]'::jsonb,
  current_bet bigint not null default 0,
  joined_at timestamptz default now(),
  constraint unique_room_seat unique (room_id, seat),
  constraint unique_room_user unique (room_id, user_id)
);

-- ==========================================================
-- 触发器：用户注册时自动同步创建 profiles 记录并赠送初始金币
-- ==========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nickname, avatar_url, chips, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    10000,
    false
  );
  -- 记录初始注册赠送流水
  insert into public.chip_transactions (user_id, amount, type, balance_after, note)
  values (new.id, 10000, 'register_bonus', 10000, '新玩家注册赠送体验金');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================================
-- 存储过程：原子性每日签到领取奖励
-- ==========================================================
create or replace function public.claim_daily_checkin(p_user_id uuid)
returns jsonb as $$
declare
  v_today date := current_date;
  v_last_checkin date;
  v_streak int := 1;
  v_reward int := 1000;
  v_current_chips bigint;
  v_new_chips bigint;
begin
  -- 检查今天是否已签到
  if exists (select 1 from public.daily_checkins where user_id = p_user_id and checkin_date = v_today) then
    return jsonb_build_object('success', false, 'message', '今日已签到，明天再来吧！');
  end if;

  -- 查找上一条签到记录计算连签天数
  select checkin_date, streak_days into v_last_checkin, v_streak
  from public.daily_checkins
  where user_id = p_user_id
  order by checkin_date desc
  limit 1;

  if v_last_checkin is not null and v_last_checkin = (v_today - interval '1 day')::date then
    v_streak := v_streak + 1;
  else
    v_streak := 1;
  end if;

  -- 根据连续签到天数梯度阶梯加成 (上限7天循环)
  v_reward := 1000 + ((v_streak - 1) % 7) * 500;

  -- 插入签到记录
  insert into public.daily_checkins (user_id, checkin_date, reward_chips, streak_days)
  values (p_user_id, v_today, v_reward, v_streak);

  -- 更新用户余额
  update public.profiles
  set chips = chips + v_reward, updated_at = now()
  where id = p_user_id
  returning chips into v_new_chips;

  -- 记录流水
  insert into public.chip_transactions (user_id, amount, type, balance_after, note)
  values (p_user_id, v_reward, 'daily_checkin', v_new_chips, '连续第 ' || v_streak || ' 天签到奖励');

  return jsonb_build_object(
    'success', true,
    'reward', v_reward,
    'streak', v_streak,
    'new_balance', v_new_chips
  );
end;
$$ language plpgsql security definer;

-- ==========================================================
-- 存储过程：游戏局结算（原子扣除或加分，记流水与战绩）
-- ==========================================================
create or replace function public.settle_game(
  p_user_id uuid,
  p_game_type text,
  p_bet_amount bigint,
  p_payout bigint,
  p_details jsonb default '{}'::jsonb
)
returns jsonb as $$
declare
  v_net_profit bigint := p_payout - p_bet_amount;
  v_current_chips bigint;
  v_new_chips bigint;
  v_type text;
begin
  select chips into v_current_chips from public.profiles where id = p_user_id for update;

  if v_current_chips is null then
    return jsonb_build_object('success', false, 'message', '用户不存在');
  end if;

  -- 检查余额是否能够扣除本次下注（如果在前端未先扣除的话）
  -- 本结算函数以净盈亏直接调整余额
  v_new_chips := v_current_chips + v_net_profit;
  if v_new_chips < 0 then
    v_new_chips := 0;
  end if;

  update public.profiles
  set chips = v_new_chips, updated_at = now()
  where id = p_user_id;

  -- 记录战绩
  insert into public.game_records (user_id, game_type, bet_amount, payout, net_profit, details)
  values (p_user_id, p_game_type, p_bet_amount, p_payout, v_net_profit, p_details);

  -- 记录流水
  if v_net_profit >= 0 then
    v_type := 'game_win';
  else
    v_type := 'game_loss';
  end if;

  insert into public.chip_transactions (user_id, amount, type, balance_after, note)
  values (
    p_user_id,
    v_net_profit,
    v_type,
    v_new_chips,
    p_game_type || ' 对局结算 (下注: ' || p_bet_amount || ', 派彩: ' || p_payout || ')'
  );

  return jsonb_build_object(
    'success', true,
    'net_profit', v_net_profit,
    'new_balance', v_new_chips
  );
end;
$$ language plpgsql security definer;

-- ==========================================================
-- 存储过程：管理员后台给玩家调整/赠送筹码
-- ==========================================================
create or replace function public.admin_grant_chips(
  p_target_user_id uuid,
  p_amount bigint,
  p_reason text default '管理员后台调整赠送'
)
returns jsonb as $$
declare
  v_caller_id uuid := auth.uid();
  v_is_admin boolean;
  v_target_chips bigint;
  v_new_chips bigint;
  v_type text;
begin
  -- 验证调用者是否为管理员
  select is_admin into v_is_admin from public.profiles where id = v_caller_id;

  if v_is_admin is not true then
    return jsonb_build_object('success', false, 'message', '无权操作：需要管理员权限！');
  end if;

  select chips into v_target_chips from public.profiles where id = p_target_user_id for update;
  if v_target_chips is null then
    return jsonb_build_object('success', false, 'message', '目标用户不存在！');
  end if;

  v_new_chips := v_target_chips + p_amount;
  if v_new_chips < 0 then
    v_new_chips := 0;
  end if;

  update public.profiles
  set chips = v_new_chips, updated_at = now()
  where id = p_target_user_id;

  if p_amount >= 0 then
    v_type := 'admin_grant';
  else
    v_type := 'admin_deduct';
  end if;

  insert into public.chip_transactions (user_id, amount, type, balance_after, note)
  values (p_target_user_id, p_amount, v_type, v_new_chips, p_reason);

  return jsonb_build_object(
    'success', true,
    'target_user_id', p_target_user_id,
    'amount', p_amount,
    'new_balance', v_new_chips
  );
end;
$$ language plpgsql security definer;

-- ==========================================================
-- RLS 安全策略与权限
-- ==========================================================
alter table public.profiles enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.chip_transactions enable row level security;
alter table public.game_records enable row level security;
alter table public.game_rooms enable row level security;
alter table public.room_players enable row level security;

-- profiles: 允许公开读取排行榜与玩家基础信息，允许本人修改昵称/头像
create policy "profiles_select_policy" on public.profiles for select using (true);
create policy "profiles_update_policy" on public.profiles for update using (auth.uid() = id);

-- daily_checkins: 仅本人能读取自己的签到记录
create policy "checkins_select_policy" on public.daily_checkins for select using (auth.uid() = user_id);
create policy "checkins_insert_policy" on public.daily_checkins for insert with check (auth.uid() = user_id);

-- chip_transactions: 本人或管理员可读
create policy "transactions_select_policy" on public.chip_transactions for select using (
  auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- game_records: 允许所有人查阅公共战绩榜，允许本人记录
create policy "records_select_policy" on public.game_records for select using (true);
create policy "records_insert_policy" on public.game_records for insert with check (auth.uid() = user_id);

-- game_rooms: 房间大厅对认证用户开放查阅、创建、更新
create policy "rooms_select_policy" on public.game_rooms for select using (true);
create policy "rooms_insert_policy" on public.game_rooms for insert with check (auth.uid() is not null);
create policy "rooms_update_policy" on public.game_rooms for update using (auth.uid() is not null);
create policy "rooms_delete_policy" on public.game_rooms for delete using (auth.uid() = host_id);

-- room_players: 房间在桌玩家表
create policy "room_players_select_policy" on public.room_players for select using (true);
create policy "room_players_insert_policy" on public.room_players for insert with check (auth.uid() = user_id);
create policy "room_players_update_policy" on public.room_players for update using (auth.uid() is not null);
create policy "room_players_delete_policy" on public.room_players for delete using (auth.uid() = user_id);

-- ==========================================================
-- 开启 Supabase 实时广播 Realtime 复制
-- ==========================================================
alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.room_players;
alter publication supabase_realtime add table public.game_records;
alter publication supabase_realtime add table public.profiles;

-- ==========================================================
-- 便捷管理命令说明：
-- 若需将某个注册账号设置为管理员，可在 SQL Editor 中执行：
-- update public.profiles set is_admin = true where email = '你的注册邮箱@xxx.com';
-- ==========================================================
