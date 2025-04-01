## 部署说明

1. 复制配置文件模板：
```bash
cp docker-compose.yml.example docker-compose.yml
```

2. 根据实际环境修改 docker-compose.yml：
- 修改镜像地址
- 调整端口映射
- 配置数据卷路径
- 其他自定义配置

3. 启动服务：
```bash
docker-compose up -d
``` 