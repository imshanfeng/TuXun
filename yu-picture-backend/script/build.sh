#!/bin/bash
# build.sh
# 打包前后端项目

if [ -z "${BASH_VERSION:-}" ]; then
    exec bash "$0" "$@"
fi

# 切换到脚本上一级目录（即后端根目录）
BACKEND_DIR=$(cd "$(dirname "$0")/.." && pwd)
# 前端根目录
FRONTEND_DIR=$(cd "$BACKEND_DIR/../yu-picture-fronted" && pwd)

ensure_frontend_node() {
    local node_major=""

    if [ -n "${NVM_DIR:-}" ] || [ -s "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
        # shellcheck disable=SC1090
        . "$NVM_DIR/nvm.sh"
        if nvm use 20 >/dev/null 2>&1; then
            echo "前端构建使用 Node: $(node -v)"
            return 0
        fi
        if nvm use 18 >/dev/null 2>&1; then
            echo "前端构建使用 Node: $(node -v)"
            return 0
        fi
    fi

    if [ -x /usr/local/bin/node ]; then
        export PATH="/usr/local/bin:$PATH"
    fi

    if command -v node >/dev/null 2>&1; then
        node_major=$(node -p "process.versions.node.split('.')[0]" 2>/dev/null)
        if [ -n "$node_major" ] && [ "$node_major" -ge 18 ]; then
            echo "前端构建使用 Node: $(node -v)"
            return 0
        fi
    fi

    echo "前端打包需要 Node 18+，当前可用版本不足。"
    return 1
}

echo "开始打包后端项目 (yu-picture-backend)..."
cd "$BACKEND_DIR" || exit
mvn clean package -DskipTests
if [ $? -eq 0 ]; then
    echo "后端打包成功！"
else
    echo "后端打包失败！"
    exit 1
fi

echo "开始打包前端项目 (yu-picture-fronted)..."
cd "$FRONTEND_DIR" || exit
ensure_frontend_node || exit 1
npm install
npm run build
if [ $? -eq 0 ]; then
    echo "前端打包成功！构建产物在 dist/ 目录下。"
else
    echo "前端打包失败！"
    exit 1
fi

echo "整个项目打包完毕。"
