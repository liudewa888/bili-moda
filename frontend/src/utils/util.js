export const isPhone = () => {
  const userAgent = navigator.userAgent || window.opera;
  const mobileRegex =
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const screenWidth = window.innerWidth;
  // 如果用户代理字符串匹配手机，或者屏幕宽度小于某个阈值（例如768px）
  return mobileRegex.test(userAgent.toLowerCase()) || screenWidth <= 768;
};
