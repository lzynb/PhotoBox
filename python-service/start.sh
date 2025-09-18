#!/bin/bash
# 启动脚本
echo "Starting PhotoBox Python Service..."

# 检查 Python 版本
python --version

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
