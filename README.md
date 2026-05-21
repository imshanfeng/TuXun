# 图寻 

一个云端图片管理平台，支持图片上传、存储、管理、搜索和分享。提供公共图库、私有/团队空间、图片审核、AI 扩图、以图搜图、按颜色搜图、实时协作编辑等功能。

## 功能特性

- **图片上传与管理** — 支持文件上传和 URL 上传，自动生成缩略图，提取图片元信息（尺寸、格式、主色调等），使用阿里云 OSS 存储
- **公共图库** — 首页展示已审核通过的图片，支持按关键词搜索、分类筛选（模板、电商、表情包、素材、海报）和标签筛选
- **私有/团队空间** — 用户可创建不同等级的私有空间（普通/专业/旗舰），团队空间支持多成员协作，提供角色权限管理（查看者/编辑者/管理员）
- **图片审核** — 管理员审核机制，支持通过/拒绝，管理员上传的图片自动过审
- **以图搜图** — 基于网页抓取的相似图片搜索
- **按颜色搜图** — 在空间内根据主色调搜索相似图片
- **AI 扩图** — 集成阿里云 AI，支持图片扩展（outpainting）
- **批量导入** — 从必应图片搜索结果批量抓取并上传（单次最多 30 张）
- **实时协作编辑** — 基于 WebSocket + LMAX Disruptor 的多人实时图片编辑
- **空间数据分析** — 空间用量、分类分布、标签分布、图片大小分布、用户活跃度等统计图表
- **VIP 会员系统** — 会员兑换码、会员过期时间、专属会员编号
- **暗色模式** — 前端支持亮色/暗色主题切换
- **响应式布局** — 适配移动端

## 技术栈

### 后端

| 类别 | 技术 |
|------|------|
| 语言 | Java 8 |
| 框架 | Spring Boot 2.7.6 |
| ORM | MyBatis-Plus 3.5.9 |
| 数据库 | MySQL |
| 缓存 | Redis + Caffeine（多级缓存） |
| 认证 | Sa-Token 1.39.0 |
| 对象存储 | 阿里云 OSS |
| 图片处理 | Thumbnailator |
| 数据库分片 | Apache ShardingSphere 5.2.0 |
| WebSocket | Spring WebSocket + LMAX Disruptor |
| API 文档 | Knife4j 4.4.0 |

### 前端

| 类别 | 技术 |
|------|------|
| 语言 | TypeScript |
| 框架 | Vue 3 (Composition API) |
| 构建工具 | Vite 6.0 |
| UI 组件库 | Ant Design Vue 4.2 |
| 状态管理 | Pinia |
| 图表 | ECharts + vue-echarts |
| 图片裁剪 | vue-cropper |

## 项目结构

```
图寻/
├── yu-picture-backend/       # 后端（分层架构）
│   ├── src/main/java/com/yupi/yupicturebackend/
│   │   ├── controller/       # 控制器
│   │   ├── service/          # 业务逻辑层
│   │   ├── mapper/           # MyBatis-Plus Mapper
│   │   ├── model/            # 实体、DTO、VO、枚举
│   │   ├── manager/          # 通用管理器（文件、OSS、认证、WebSocket）
│   │   ├── api/              # 外部 API 集成
│   │   ├── config/           # 配置类
│   │   └── aop/              # AOP 切面
│   ├── sql/                  # 建表 SQL
│   ├── script/               # 部署脚本
│   └── httpTest/             # HTTP 测试文件
│
├── yu-picture-backend-ddd/   # 后端（DDD 架构）
│   ├── interfaces/           # 接口层（控制器、DTO、VO）
│   ├── application/          # 应用服务层
│   ├── domain/               # 领域层（实体、仓储、领域服务）
│   ├── infrastructure/       # 基础设施层（仓储实现、配置）
│   └── shared/               # 共享模块（认证、分片、WebSocket）
│
└── yu-picture-fronted/       # 前端
    ├── src/pages/            # 页面组件
    ├── src/components/       # 公共组件
    ├── src/api/              # 自动生成的 API 客户端
    ├── src/router/           # 路由配置
    ├── src/stores/           # Pinia 状态管理
    └── src/layouts/          # 布局组件
```

## 快速开始

### 环境要求

- Java 8+
- Maven
- Node.js 18+
- MySQL
- Redis

### 后端启动

```bash
cd yu-picture-backend

# 1. 创建数据库并执行建表脚本
mysql -u root -p < sql/create_table.sql

# 2. 修改配置文件（数据库、Redis、阿里云 OSS 等）
#    编辑 src/main/resources/application-local.yml

# 3. 打包并运行
mvn clean package -DskipTests
java -jar target/yu-picture-backend-0.0.1-SNAPSHOT.jar
```

后端默认运行在 `http://localhost:8888/api`，API 文档地址：`http://localhost:8888/api/doc.html`

### 前端启动

```bash
cd yu-picture-fronted

# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

前端默认运行在 `http://localhost:3000`。

### API 客户端生成

前端使用 `@umijs/openapi` 从后端 Knife4j OpenAPI 规范自动生成 TypeScript API 客户端：

```bash
cd yu-picture-fronted
npm run openapi
```

## 配置说明

在 `application-local.yml` 中配置以下关键参数：

```yaml
# 数据库
spring.datasource.url: jdbc:mysql://localhost:3306/yu_picture
spring.datasource.username: root
spring.datasource.password: 你的密码

# Redis
spring.redis.host: localhost
spring.redis.port: 6379

# 阿里云 OSS
oss.client.endpoint: oss-cn-shenzhen.aliyuncs.com
oss.client.accessKeyId: 你的 AccessKeyId
oss.client.accessKeySecret: 你的 AccessKeySecret
oss.client.bucket: 你的 Bucket
oss.client.host: 你的访问域名

# 阿里云 AI（扩图功能）
aliYunAi.apiKey: 你的 API Key
```

## 部署

项目提供了部署脚本：

```bash
# 构建（后端 + 前端）
bash script/build.sh

# 启动
bash script/start.sh

# 停止
bash script/stop.sh
```

Nginx 配置参考项目根目录下的 `nginx.conf`。

## 数据库表结构

| 表名 | 说明 |
|------|------|
| `user` | 用户表（账号、密码、角色、VIP 信息） |
| `picture` | 图片表（URL、元信息、分类、标签、审核状态、空间关联） |
| `space` | 空间表（名称、等级、类型、容量限制、用量统计） |
| `space_user` | 空间用户关联表（空间 ID、用户 ID、角色） |
