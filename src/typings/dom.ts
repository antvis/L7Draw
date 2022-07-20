/**
 * 遍历当前结点 dom 的本身及其所有父节点，直到找到对应
 * @param dom
 * @param className
 * @returns
 */
export const getParentByClassName = (dom: Element, className: string) => {
  let currentDom: Element | null = dom;
  while (currentDom && !Array.from(currentDom.classList).includes(className)) {
    currentDom = currentDom.parentElement;
  }
  return currentDom;
};
