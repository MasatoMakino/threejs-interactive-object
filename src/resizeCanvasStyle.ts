/**
 * アスペクト比を保ちつつ、canvas要素のスタイルをリサイズする。
 * canvasの表示サイズのみを変更し、描画サイズは変更しない。
 * そのため、描画負荷は変わらないので注意。画質の劣化や描画負荷が過剰な場合は、解像度を変更する方法を検討すること。
 *
 * @param container
 * @param canvas
 * @param canvasWidth
 * @param canvasHeight
 */
export function resizeCanvasStyle(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const aspectRatio = canvasWidth / canvasHeight;

  if (containerWidth / containerHeight > aspectRatio) {
    canvas.style.width = `${containerHeight * aspectRatio}px`;
    canvas.style.height = `${containerHeight}px`;
  } else {
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerWidth / aspectRatio}px`;
  }
}
