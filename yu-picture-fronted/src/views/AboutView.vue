<template>
  <div id="aboutPage">
    <div class="about-container">
      <div class="about-header">
        <h1 class="title">关于 图寻</h1>
        <div class="subtitle">企业级智能协同云图库</div>
      </div>
      
      <div class="about-content">
        <p>
          <strong>图寻</strong> 是一款专为企业和团队打造的高效、智能的图片协同管理平台。我们致力于解决海量图片资产的存储、检索、共享与管理难题，让图片的价值得到最大化释放。
        </p>
        
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">🚀</div>
            <div class="feature-text">
              <h3>极速体验</h3>
              <p>采用先进的架构设计，提供流畅的图片上传、浏览与处理速度。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <div class="feature-text">
              <h3>安全可靠</h3>
              <p>企业级数据保护，完善的权限管理体系，保障您的数字资产安全。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💡</div>
            <div class="feature-text">
              <h3>智能标签</h3>
              <p>自动化提取图片信息，支持灵活的标签体系，让检索变得轻松自如。</p>
            </div>
          </div>
        </div>
        
        <div class="footer-info">
          <p>当前环境：Vue 3 + Vite + Ant Design Vue</p>
          <p>版本：v1.0.0</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#aboutPage {
  min-height: calc(100vh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: radial-gradient(circle at 50% 50%, rgba(22, 119, 255, 0.05) 0%, transparent 60%);
}

.about-container {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 48px;
  animation: fadeUp 0.6s ease-out forwards;
}

.about-header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #1677ff, #52c41a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  font-size: 16px;
  color: #6c757d;
  letter-spacing: 1px;
}

.about-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.about-content > p {
  text-align: center;
  margin-bottom: 40px;
  color: #555;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  background: #fff;
}

.feature-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.feature-text h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f1f1f;
}

.feature-text p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.footer-info {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #999;
}

.footer-info p {
  margin: 4px 0;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
