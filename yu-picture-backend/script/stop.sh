#!/bin/bash
# stop.sh
# 停止后端服务

BACKEND_DIR=$(cd "$(dirname "$0")/.." && pwd)

echo "正在停止 yu-picture 后端..."

cd "$BACKEND_DIR" || exit

if [ -f "run.pid" ]; then
    PID=$(cat run.pid)
    kill -9 $PID
    rm run.pid
    echo "后端进程 (PID $PID) 已停止。"
else
    # 按照名称查找进程兜底
    PID=$(pgrep -f "yu-picture-backend-0.0.1.jar")
    if [ -n "$PID" ]; then
        kill -9 $PID
        echo "找到了正在运行的后端进程 (PID $PID)，已停止。"
    else
        echo "未发现正在运行的后端进程。"
    fi
fi
