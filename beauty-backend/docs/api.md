## 通用响应格式

所有API响应都遵循以下格式：

```json
{
  "code": "000000",        // 响应代码：成功="000000"，错误="A00xxx"
  "statusCode": 200,       // HTTP状态码
  "msg": "Success",        // 响应消息
  "data": null,           // 响应数据，错误时为null
  "timestamp": "2025-01-02 14:11:30.123" // 服务器时间戳
}
```

## 用户API

### 注册用户

- **URL**: `/api/v1/users/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "string",  // 必填，用户名
    "password": "string",  // 必填，密码
    "email": "string"      // 必填，电子邮件
  }
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 201,
    "msg": "用户注册成功",
    "data": {
      "username": "testuser",
      "email": "test@example.com"
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```
- **错误响应**:
  - 用户名已存在:
    ```json
    {
      "code": "A00100",
      "statusCode": 400,
      "msg": "用户名已存在",
      "data": null,
      "timestamp": "2025-01-02 14:11:30.123"
    }
    ```

### 用户登录

- **URL**: `/api/v1/users/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "string",  // 必填，用户名
    "password": "string"   // 必填，密码
  }
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "登录成功",
    "data": {
      "token": "jwt_token_string",
      "user": {
        "username": "testuser",
        "email": "test@example.com"
      }
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```
- **错误响应**:
  - 用户名或密码错误:
    ```json
    {
      "code": "A00101",
      "statusCode": 401,
      "msg": "用户名或密码错误",
      "data": null,
      "timestamp": "2025-01-02 14:11:30.123"
    }
    ```
