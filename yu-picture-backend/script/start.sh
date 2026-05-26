#!/bin/bash
# start.sh
# 启动后端服务

BACKEND_DIR=$(cd "$(dirname "$0")/.." && pwd)

echo "正在启动 yu-picture 后端..."

cd "$BACKEND_DIR" || exit

# 检查是否已经在运行
if [ -f "run.pid" ]; then
    PID=$(cat run.pid)
    if ps -p $PID > /dev/null; then
        echo "后端服务已经在运行中 (PID $PID)！请勿重复启动。如需重启请先执行 stop.sh"
        exit 1
    else
        # PID 文件存在但进程已挂掉，删除无效的 pid 文件
        rm run.pid
    fi
fi

# 二次通过名称检查，防止 run.pid 丢失导致重复启动
RUNNING_PID=$(pgrep -f "yu-picture-backend-0.0.1.jar")
if [ -n "$RUNNING_PID" ]; then
    echo "后端服务已经在运行中 (PID $RUNNING_PID)！请勿重复启动。如需重启请先执行 stop.sh"
    exit 1
fi

# 确保目录存在
sudo mkdir -p /data/tuxun/
sudo chmod 777 /data/tuxun/

JAR_NAME="yu-picture-backend-0.0.1.jar"
if [ -f "$BACKEND_DIR/target/$JAR_NAME" ]; then
    JAR_PATH="$BACKEND_DIR/target/$JAR_NAME"
elif [ -f "$BACKEND_DIR/$JAR_NAME" ]; then
    JAR_PATH="$BACKEND_DIR/$JAR_NAME"
else
    echo "启动失败：未找到 $JAR_NAME 文件！"
    echo "请确认该包已经放到 $BACKEND_DIR 或 $BACKEND_DIR/target/ 目录下。"
    exit 1
fi

nohup java -Xms512m -Xmx512m -jar "$JAR_PATH" --spring.profiles.active=prod >> /data/tuxun/yu-picture.log 2>&1 &

echo $! > run.pid
echo "后端已在后台启动，PID 为 $(cat run.pid)。日志输出在 /data/tuxun/yu-picture.log"
