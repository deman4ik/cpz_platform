CREATE OR REPLACE FUNCTION p_robot_statistics_calc(
  nROBOT_ID in numeric,
  uidUSER_ID in uuid,
  nFLAG_RECREATE in integer
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  rec        RECORD;
  rSTAT      robot_statistics%ROWTYPE;
  rSTAT2     robot_statistics%ROWTYPE;
  nWIN_ALL   numeric;
  nWIN_SHORT numeric;
  nWIN_LONG  numeric;
  nGROSS_PROFIT_ALL   numeric;
  nGROSS_PROFIT_SHORT numeric;
  nGROSS_PROFIT_LONG  numeric;
  nGROSS_LOSS_ALL     numeric;
  nGROSS_LOSS_SHORT   numeric;
  nGROSS_LOSS_LONG    numeric;
  nNET_PROFIT_ALL     numeric;
  nNET_PROFIT_LONG    numeric;
  nNET_PROFIT_SHORT   numeric;
  nAVG_PROFIT_ALL     numeric;
  nAVG_PROFIT_SHORT   numeric;
  nAVG_PROFIT_LONG    numeric;
  nAVG_LOSS_ALL       numeric;
  nAVG_LOSS_SHORT     numeric;
  nAVG_LOSS_LONG      numeric;
  sUMEAS     varchar(10);
  nCNT_LOSE  int;
  nMAX_CONS_LOSES  int;
  nMAX_DRAWDOWN    numeric;
  dMAX_DRAWDOWN_DT timestamp;
  nMAX_CONS_WIN    int;
  nCNT_WIN         int;
  uidUSER_ROBOT_ID       uuid;
BEGIN

  select t.id into uidUSER_ROBOT_ID from user_robot t where t.user_id = uidUSER_ID and t.robot_id = nROBOT_ID;

  if nFLAG_RECREATE = 1 then
    if uidUSER_ROBOT_ID is not null then
      delete from robot_statistics t WHERE t.user_robot_id = uidUSER_ROBOT_ID;
    else
      delete from robot_statistics t WHERE t.robot_id = nROBOT_ID;
    end if;
  end if;

  rSTAT.robot_id := nROBOT_ID;
  rSTAT2.robot_id := nROBOT_ID;

  sUMEAS := ', ' || '$';

  --------
  rSTAT.sort_order := 1;
  rSTAT.stat_name := 'Net Profit'||sUMEAS;
  SELECT
    round( sum(t.profit),2),
    round( sum(case when t.direction = 'sell' then t.profit else 0 end),2),
    round( sum(case when t.direction = 'buy' then t.profit else 0 end),2)
  INTO STRICT rSTAT.all_trades, rSTAT.short_trades, rSTAT.long_trades
  FROM positions t WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto');
  nNET_PROFIT_ALL   := rSTAT.all_trades;
  nNET_PROFIT_LONG  := rSTAT.long_trades;
  nNET_PROFIT_SHORT := rSTAT.short_trades;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );
  --on conflict do nothing; -- both for uk and pk

  --------
  rSTAT2.sort_order := 2;
  rSTAT2.stat_name := 'Number of Trades';
  SELECT
    count(id),
    sum(case when t.direction = 'sell' then 1 else 0 end),
    sum(case when t.direction = 'buy' then 1 else 0 end)
  INTO STRICT rSTAT2.all_trades, rSTAT2.short_trades, rSTAT2.long_trades
  FROM positions t WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto') ;

  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT2.stat_name, rSTAT2.sort_order, rSTAT2.robot_id, uidUSER_ROBOT_ID, rSTAT2.all_trades, rSTAT2.long_trades, rSTAT2.short_trades
  );
  if rSTAT2.all_trades = 0 then
    rSTAT2.all_trades := null;
  end if;
  if rSTAT2.short_trades = 0 then
    rSTAT2.short_trades := null;
  end if;
  if rSTAT2.long_trades = 0 then
    rSTAT2.long_trades := null;
  end if;

  --------
  rSTAT.sort_order := 3;
  rSTAT.stat_name := 'Average Net Profit'||sUMEAS;
  -- Net profit / Number of trades
  rSTAT.all_trades   := round( (rSTAT.all_trades / rSTAT2.all_trades) ,2);
  rSTAT.short_trades := round( (rSTAT.short_trades / rSTAT2.short_trades) ,2);
  rSTAT.long_trades  := round( (rSTAT.long_trades / rSTAT2.long_trades) ,2);

  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------
  rSTAT.sort_order := 4;
  rSTAT.stat_name := 'Average Bars Held';
  SELECT
    round( sum(t.bars_held) / rSTAT2.all_trades ),
    round( sum(case when t.direction = 'sell' then t.bars_held else 0 end) / rSTAT2.short_trades ),
    round( sum(case when t.direction = 'buy' then t.bars_held else 0 end) / rSTAT2.long_trades )
  INTO STRICT rSTAT.all_trades, rSTAT.short_trades, rSTAT.long_trades
  FROM positions t WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto') ;

  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------------------------------
  --------------------------------
  rSTAT.sort_order := 5;
  rSTAT.stat_name := 'Winning Trades Count';
  SELECT
    count(t.id),
    sum(case when t.direction = 'sell' then 1 else 0 end),
    sum(case when t.direction = 'buy' then 1 else 0 end)
  INTO STRICT rSTAT.all_trades, rSTAT.short_trades, rSTAT.long_trades
  FROM positions t WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto') and t.profit > 0;
  nWIN_ALL   := rSTAT.all_trades;
  nWIN_SHORT := rSTAT.short_trades;
  nWIN_LONG  := rSTAT.long_trades;
  if nWIN_ALL = 0 then
    nWIN_ALL := null;
  end if;
  if nWIN_SHORT = 0 then
    nWIN_SHORT := null;
  end if;
  if nWIN_LONG = 0 then
    nWIN_LONG := null;
  end if;

  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------
  rSTAT.sort_order := 6;
  rSTAT.stat_name := 'Win Rate';
  -- Win trades / number of trades
  rSTAT.all_trades   := round( (rSTAT.all_trades / rSTAT2.all_trades),2);
  rSTAT.short_trades := round( (rSTAT.short_trades / rSTAT2.short_trades),2);
  rSTAT.long_trades  := round( (rSTAT.long_trades / rSTAT2.long_trades),2);

  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------
  rSTAT.sort_order := 7;
  rSTAT.stat_name := 'Gross Profit'||sUMEAS;
  SELECT
    round( sum(t.profit),2),
    round( sum(case when t.direction = 'sell' then t.profit else 0 end),2),
    round( sum(case when t.direction = 'buy' then t.profit else 0 end),2)
  INTO STRICT rSTAT.all_trades, rSTAT.short_trades, rSTAT.long_trades
  FROM positions t WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto') and t.profit > 0;
  nGROSS_PROFIT_ALL := rSTAT.all_trades;
  nGROSS_PROFIT_SHORT := rSTAT.short_trades;
  nGROSS_PROFIT_LONG := rSTAT.long_trades;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------
  rSTAT.sort_order := 8;
  rSTAT.stat_name := 'Average Profit'||sUMEAS;
  -- Win trades / number of trades
  rSTAT.all_trades   := round( (rSTAT.all_trades / nWIN_ALL) ,2);
  rSTAT.short_trades := round( (rSTAT.short_trades / nWIN_SHORT) ,2);
  rSTAT.long_trades  := round( (rSTAT.long_trades / nWIN_LONG) ,2);
  nAVG_PROFIT_ALL := rSTAT.all_trades;
  nAVG_PROFIT_SHORT := rSTAT.short_trades;
  nAVG_PROFIT_LONG := rSTAT.long_trades;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------
  rSTAT.sort_order := 9;
  rSTAT.stat_name := 'Average Win Bars Held';
  SELECT
    round( (sum(t.bars_held) / nWIN_ALL) ::numeric,0),
    round( (sum(case when t.direction = 'sell' then t.bars_held else 0 end) / nWIN_SHORT) ::numeric,0),
    round( (sum(case when t.direction = 'buy' then t.bars_held else 0 end) / nWIN_LONG) ::numeric,0)
  INTO STRICT rSTAT.all_trades, rSTAT.short_trades, rSTAT.long_trades
  FROM positions t WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto') and t.profit > 0;

  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );


  ---------------------------------
  ---------------------------------
  rSTAT.sort_order := 20;
  rSTAT.stat_name := 'Losing Trades Count';
  SELECT
    count(t.id),
    sum(case when t.direction = 'sell' then 1 else 0 end),
    sum(case when t.direction = 'buy' then 1 else 0 end)
  INTO STRICT rSTAT.all_trades, rSTAT.short_trades, rSTAT.long_trades
  FROM positions t WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto') and t.profit < 0;
  nWIN_ALL   := rSTAT.all_trades;
  nWIN_SHORT := rSTAT.short_trades;
  nWIN_LONG  := rSTAT.long_trades;
  if nWIN_ALL = 0 then
    nWIN_ALL := null;
  end if;
  if nWIN_SHORT = 0 then
    nWIN_SHORT := null;
  end if;
  if nWIN_LONG = 0 then
    nWIN_LONG := null;
  end if;

  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------
  rSTAT.sort_order := 21;
  rSTAT.stat_name := 'Loss Rate';
  -- Losing trades / number of trades
  rSTAT.all_trades   := round( (rSTAT.all_trades / rSTAT2.all_trades),2);
  rSTAT.short_trades := round( (rSTAT.short_trades / rSTAT2.short_trades),2);
  rSTAT.long_trades  := round( (rSTAT.long_trades / rSTAT2.long_trades),2);

  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------
  rSTAT.sort_order := 22;
  rSTAT.stat_name := 'Gross Loss'||sUMEAS;
  SELECT
    round( (sum(t.profit)),2),
    round( (sum(case when t.direction = 'sell' then t.profit else 0 end)),2),
    round( (sum(case when t.direction = 'buy' then t.profit else 0 end)),2)
  INTO STRICT rSTAT.all_trades, rSTAT.short_trades, rSTAT.long_trades
  FROM positions t WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto') and t.profit < 0;
  nGROSS_LOSS_ALL := rSTAT.all_trades;
  nGROSS_LOSS_SHORT := rSTAT.short_trades;
  nGROSS_LOSS_LONG := rSTAT.long_trades;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------
  rSTAT.sort_order := 23;
  rSTAT.stat_name := 'Average Loss'||sUMEAS;
  -- Gross loss / number of trades
  rSTAT.all_trades   := round( (rSTAT.all_trades / nWIN_ALL) ,2);
  rSTAT.short_trades := round( (rSTAT.short_trades / nWIN_SHORT) ,2);
  rSTAT.long_trades  := round( (rSTAT.long_trades / nWIN_LONG) ,2);
  nAVG_LOSS_ALL := rSTAT.all_trades;
  nAVG_LOSS_SHORT := rSTAT.short_trades;
  nAVG_LOSS_LONG := rSTAT.long_trades;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  --------
  rSTAT.sort_order := 24;
  rSTAT.stat_name := 'Average Losing Bars Held';
  SELECT
    round( (sum(t.bars_held) / nWIN_ALL) ),
    round( (sum(case when t.direction = 'sell' then t.bars_held else 0 end) / nWIN_SHORT) ),
    round( (sum(case when t.direction = 'buy' then t.bars_held else 0 end) / nWIN_LONG) )
  INTO STRICT rSTAT.all_trades, rSTAT.short_trades, rSTAT.long_trades
  FROM positions t WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto') and t.profit < 0;

  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  -- drawdown and Consecutive win/lose
  -- alg. must match v_robot_roundtrips_c
  nCNT_LOSE := 0;
  nCNT_WIN  := 0;
  nMAX_CONS_LOSES := 0;
  nMAX_CONS_WIN   := 0;
  nMAX_DRAWDOWN   := 0;
  dMAX_DRAWDOWN_DT := null;
  for rec in (
    select
      tt.profit,
      tt.c_balance,
      tt.entry_date,
      max(tt.c_balance) over (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ) as max_prepare
    from
      (select
         t.*,
         round(
             sum(profit) over (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ) :: numeric
         ,2) as c_balance
        from
        positions t
        WHERE robot_id = nROBOT_ID and user_id = uidUSER_ID and status in ('closed','closedAuto')
        order by entry_date, exit_date, id
      ) tt
    order by tt.entry_date, tt.exit_date, tt.id
  ) loop
    -- max drawdown
    if rec.max_prepare = rec.c_balance then
      null;
    else
      rec.max_prepare := (rec.max_prepare - rec.c_balance) * (-1);
      if rec.max_prepare < nMAX_DRAWDOWN then
         nMAX_DRAWDOWN := rec.max_prepare;
         dMAX_DRAWDOWN_DT := rec.entry_date;
      end if;
    end if;

    -- take series of loses
    if rec.profit < 0 then
      nCNT_LOSE := nCNT_LOSE + 1;
    else
      if nCNT_LOSE > nMAX_CONS_LOSES then
        nMAX_CONS_LOSES := nCNT_LOSE;
       end if;
      nCNT_LOSE := 0;
    end if;

    -- take series of winners
    if rec.profit > 0 then
      nCNT_WIN := nCNT_WIN + 1;
    else
      if nCNT_WIN > nMAX_CONS_WIN then
        nMAX_CONS_WIN := nCNT_WIN;
      end if;
      nCNT_WIN := 0;
    end if;
  end loop;

  rSTAT.sort_order := 10;
  rSTAT.stat_name := 'Max Consecutive Winners';
  rSTAT.all_trades := nMAX_CONS_WIN;
  rSTAT.long_trades := null;
  rSTAT.short_trades := null;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  rSTAT.sort_order := 25;
  rSTAT.stat_name := 'Max Consecutive Losses';
  rSTAT.all_trades := nMAX_CONS_LOSES;
  rSTAT.long_trades := null;
  rSTAT.short_trades := null;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  rSTAT.sort_order := 30;
  rSTAT.stat_name := 'Max Drawdown';
  rSTAT.all_trades := nMAX_DRAWDOWN;
  rSTAT.long_trades := null;
  rSTAT.short_trades := null;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  rSTAT.sort_order := 31;
  rSTAT.stat_name := 'Max Drawdown Date';
  rSTAT.all_trades   := null;
  rSTAT.long_trades  := null;
  rSTAT.short_trades := null;
  rSTAT.note         := to_char(dMAX_DRAWDOWN_DT, 'dd.mm.yyyy');
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades, note
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades, rSTAT.note
  );

  rSTAT.sort_order := 32;
  rSTAT.stat_name := 'Profit Factor';
  if nGROSS_LOSS_ALL != 0 then
    rSTAT.all_trades   := round(nGROSS_PROFIT_ALL/nGROSS_LOSS_ALL,2)*-1;
  else
    rSTAT.all_trades := 0;
  end if;
  if nGROSS_LOSS_LONG != 0 then
    rSTAT.long_trades  := round(nGROSS_PROFIT_LONG/nGROSS_LOSS_LONG,2)*-1;
  else
    rSTAT.long_trades := 0;
  end if;
  if nGROSS_LOSS_SHORT != 0 then
    rSTAT.short_trades := round(nGROSS_PROFIT_SHORT/nGROSS_LOSS_SHORT,2)*-1;
  else
    rSTAT.short_trades := 0;
  end if;
  rSTAT.note         := null;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );



  rSTAT.sort_order := 33;
  rSTAT.stat_name := 'Recovery Factor';
  if nMAX_DRAWDOWN != 0 then
    rSTAT.all_trades   := round(nNET_PROFIT_ALL/nMAX_DRAWDOWN,2)*-1;
  else
    rSTAT.all_trades := 0;
  end if;
  /*if nGROSS_LOSS_LONG != 0 then
    rSTAT.long_trades  := round(nGROSS_PROFIT_LONG/nGROSS_LOSS_LONG,2);
  else
    rSTAT.long_trades := 0;
  end if;
  if nGROSS_LOSS_SHORT != 0 then
    rSTAT.short_trades := round(nGROSS_PROFIT_SHORT/nGROSS_LOSS_SHORT,2);
  else
    rSTAT.short_trades := 0;
  end if;*/
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );

  rSTAT.sort_order := 34;
  rSTAT.stat_name := 'Payoff Ratio';
  if nAVG_LOSS_ALL != 0 then
    rSTAT.all_trades   := round(nAVG_PROFIT_ALL/nAVG_LOSS_ALL,2)*-1;
  else
    rSTAT.all_trades := 0;
  end if;
  if nAVG_LOSS_LONG != 0 then
    rSTAT.long_trades  := round(nAVG_PROFIT_LONG/nAVG_LOSS_LONG,2)*-1;
  else
    rSTAT.long_trades := 0;
  end if;
  if nAVG_LOSS_SHORT != 0 then
    rSTAT.short_trades := round(nAVG_PROFIT_SHORT/nAVG_LOSS_SHORT,2)*-1;
  else
    rSTAT.short_trades := 0;
  end if;
  insert into robot_statistics (
    stat_name, sort_order, robot_id, user_robot_id, all_trades, long_trades, short_trades
  ) values (
    rSTAT.stat_name, rSTAT.sort_order, rSTAT.robot_id, uidUSER_ROBOT_ID, rSTAT.all_trades, rSTAT.long_trades, rSTAT.short_trades
  );


  RETURN 1;
END;
$$;