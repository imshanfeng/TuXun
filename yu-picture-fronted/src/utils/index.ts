/**
 * 格式化文件大小
 * @param size
 */
export const formatSize = (size: number | undefined): string => {
  if (!size) return '0 B'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 格式化比例
 * @param width
 * @param height
 */
export const formatScale = (width: number | undefined, height: number | undefined): string => {
  if (!width || !height) return '-'

  // 求最大公约数
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }

  const common = gcd(width, height)
  const ratioW = width / common
  const ratioH = height / common

  // 如果比例太复杂（如 347:192），直接返回保留两位小数的字符串
  if (ratioW > 20 || ratioH > 20) {
    return (width / height).toFixed(2)
  }

  return `${ratioW}:${ratioH} (${(width / height).toFixed(2)})`
}
