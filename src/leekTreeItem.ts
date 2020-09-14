import { join } from 'path';
import { ExtensionContext, TreeItem, TreeItemCollapsibleState } from 'vscode';
import global from './global';
import { formatTreeText } from './utils';

export enum SortType {
  NORMAL = 0,
  ASC = 1,
  DESC = -1,
}

export enum IconType {
  ARROW = 'arrow',
  FOOD1 = 'food1',
  FOOD2 = 'food2',
  FOOD3 = 'food3',
  ICON_FOOD = 'iconfood',
}

// 支持的股票类型
export const STOCK_TYPE = ['sh', 'sz', 'hk', 'gb', 'us'];

export interface IAmount {
  name: string;
  price: number | string;
  amount: number;
  priceDate: string;
  earnings: number;
  yestEarnings?: number;
}
export interface FundInfo {
  percent: any;
  name: string;
  code: string;
  showLabel?: boolean;
  symbol?: string;
  type?: string;
  yestclose?: string | number; // 昨日净值
  open?: string | number;
  highStop?: string | number;
  high?: string | number;
  lowStop?: string | number;
  low?: string | number;
  time?: string;
  updown?: string; // 涨跌值 price-yestclose
  price?: string; // 当前价格
  volume?: string; // 成交量
  amount?: string | number; // 成交额
  earnings?: number;
  isStop?: boolean; // 停牌
  t2?: boolean;
  isUpdated?: boolean;
  showEarnings?: boolean;
  isStock?: boolean;
}

export class LeekTreeItem extends TreeItem {
  info: FundInfo;
  constructor(info: FundInfo, context: ExtensionContext) {
    super('', TreeItemCollapsibleState.None);
    this.info = info;
    const {
      showLabel,
      isStock,
      name,
      code,
      type,
      symbol,
      percent,
      price,
      open,
      yestclose,
      high,
      low,
      updown,
      volume,
      amount = 0,
      earnings,
      time,
      isStop,
      t2,
    } = info;
    let _percent: number | string = Math.abs(percent);
    if (isNaN(_percent)) {
      _percent = '--';
    } else {
      _percent = _percent.toFixed(2);
    }
    let icon = 'up';
    const grow = percent.indexOf('-') === 0 ? false : true;
    const val = Math.abs(percent);
    if (grow) {
      if (IconType.ARROW === global.iconType) {
        icon = val >= 2 ? 'up' : 'up1';
      } else if (IconType.FOOD1 === global.iconType) {
        icon = 'meat2';
      } else if (IconType.FOOD2 === global.iconType) {
        icon = 'kabob';
      } else if (IconType.FOOD3 === global.iconType) {
        icon = 'wine';
      } else if (IconType.ICON_FOOD === global.iconType) {
        icon = '🍗';
      }
      _percent = '+' + _percent;
    } else {
      if (IconType.ARROW === global.iconType) {
        icon = val >= 2 ? 'down' : 'down1';
      } else if (IconType.FOOD1 === global.iconType) {
        icon = 'noodles';
      } else if (IconType.FOOD2 === global.iconType) {
        icon = 'bakeleek';
      } else if (IconType.FOOD3 === global.iconType) {
        icon = 'noodles';
      } else if (IconType.ICON_FOOD === global.iconType) {
        icon = '🍜';
      }
      _percent = '-' + _percent;
    }
    if (isStop) {
      icon = 'stop';
    }
    let iconPath = '';
    if (showLabel) {
      iconPath =
        global.iconType !== IconType.ICON_FOOD
          ? context.asAbsolutePath(join('resources', `${icon}.svg`))
          : icon;
    }
    const isIconPath = iconPath.lastIndexOf('.svg') !== -1;
    if (isIconPath) {
      this.iconPath = iconPath;
    }
    let text = '';
    if (showLabel) {
      if (isStock) {
        const risePercent = isStop
          ? formatTreeText('停牌', 11)
          : formatTreeText(`${_percent}%`, 11);
        text = `${!isIconPath ? iconPath : ''}${risePercent}${formatTreeText(
          price,
          15
        )}「${name}」`;
      } else {
        text =
          `${!isIconPath ? iconPath : ''}${formatTreeText(`${_percent}%`)}「${name}」${
            t2 || !(global.showEarnings && amount > 0) ? '' : `(${grow ? '盈' : '亏'}：${earnings})`
          }` + `${t2 ? `(${time})` : ''}`;
      }
    } else {
      text = isStock
        ? `${formatTreeText(`${_percent}%`, 11)}${formatTreeText(price, 15)} 「${code}」`
        : `${formatTreeText(`${_percent}%`)}「${code}」`;
    }

    this.label = text;
    this.id = code;
    this.command = {
      title: name, // 标题
      command: isStock ? 'leek-fund.stockItemClick' : 'leek-fund.fundItemClick', // 命令 ID
      arguments: [
        isStock ? '0' + symbol : code, // 基金/股票编码
        name, // 基金/股票名称
        text,
        `${type}${symbol}`,
      ],
    };

    if (isStock) {
      this.tooltip = `【今日行情】${
        !showLabel ? name : ''
      }${type}${symbol}\n 涨跌：${updown}   百分比：${_percent}%\n 最高：${high}   最低：${low}\n 今开：${open}   昨收：${yestclose}\n 成交量：${volume}   成交额：${amount}`;
    } else {
      this.tooltip = `「${name}」(${code})`;
    }
  }
}
