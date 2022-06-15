import { cloneDeep } from 'lodash';
import { HistoryConfig, SourceData } from '../typings';

export class History {
  /**
   * 保存历史数组的队列，越新的数据越靠前
   * @protected
   */
  protected historyList: SourceData[] = [];

  /**
   * 当前回退/重做操作后对应的index下标，回退对应index++，重做对应index--
   * @protected
   */
  protected historyIndex = 0;

  /**
   * 配置
   * @protected
   */
  protected config: HistoryConfig;

  constructor({ config }: { config: HistoryConfig }) {
    this.config = config;
  }

  save(data: SourceData) {
    if (!this.config) {
      return;
    }
    const { maxSize } = this.config;

    if (this.historyIndex) {
      this.historyList = this.historyList.slice(this.historyIndex);
      this.historyIndex = 0;
    }

    if (this.historyList.length >= maxSize) {
      this.historyList.pop();
    }
    this.historyList.unshift(cloneDeep(data));
  }

  revert() {
    if (
      !this.historyList.length ||
      this.historyIndex >= this.historyList.length - 1
    ) {
      return;
    }
    const previousData = this.historyList[++this.historyIndex];
    if (previousData) {
      return cloneDeep(previousData);
    }
  }

  redo() {
    if (!this.historyList.length || this.historyIndex <= 0) {
      return;
    }
    const nextData = this.historyList[--this.historyIndex];
    if (nextData) {
      return cloneDeep(nextData);
    }
  }
}
