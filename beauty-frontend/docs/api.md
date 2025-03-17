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

## 客户API

### 创建客户

- **URL**: `/api/v1/customers`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "name": "string",                  // 必填，客户名称
    "medicalRecordNumber": "string",   // 必填，病历号
    "avatarUrl": "string",             // 可选，头像URL
    "remarks": "string",               // 可选，备注
    "createdBy": "string",             // 必填，创建者ID
    "updatedBy": "string"              // 必填，更新者ID
  }
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 201,
    "msg": "客户创建成功",
    "data": {
      "id": "customer_id",
      "name": "客户名称",
      "medicalRecordNumber": "病历号"
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```
- **错误响应**:
  - 病历号已存在:
    ```json
    {
      "code": "A00100",
      "statusCode": 400,
      "msg": "病历号已存在",
      "data": null,
      "timestamp": "2025-01-02 14:11:30.123"
    }
    ```

### 获取客户信息

- **URL**: `/api/v1/customers/:id`
- **方法**: `GET`
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "客户获取成功",
    "data": {
      "id": "customer_id",
      "name": "客户名称",
      "medicalRecordNumber": "病历号",
      "avatarUrl": "头像URL",
      "remarks": "备注",
      "createdBy": "创建者ID",
      "updatedBy": "更新者ID",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```
- **错误响应**:
  - 客户不存在:
    ```json
    {
      "code": "A00101",
      "statusCode": 404,
      "msg": "客户不存在",
      "data": null,
      "timestamp": "2025-01-02 14:11:30.123"
    }
    ```

### 更新客户信息

- **URL**: `/api/v1/customers/:id`
- **方法**: `PUT`
- **请求体**:
  ```json
  {
    "name": "string",                  // 可选，客户名称
    "avatarUrl": "string",             // 可选，头像URL
    "remarks": "string",               // 可选，备注
    "updatedBy": "string"              // 必填，更新者ID
  }
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "客户更新成功",
    "data": {
      "id": "customer_id",
      "name": "更新后的客户名称",
      "avatarUrl": "更新后的头像URL",
      "remarks": "更新后的备注"
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 删除客户

- **URL**: `/api/v1/customers/:id`
- **方法**: `DELETE`
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "客户删除成功",
    "data": null,
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 获取客户列表

- **URL**: `/api/v1/customers`
- **方法**: `GET`
- **请求参数**:
  - `name`: 筛选客户名称
  - `medicalRecordNumber`: 筛选病历号
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "客户列表获取成功",
    "data": [
      {
        "id": "customer_id",
        "name": "客户名称",
        "medicalRecordNumber": "病历号",
        "avatarUrl": "头像URL",
        "remarks": "备注"
      }
    ],
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

## 上传API

### 上传图片

- **URL**: `/api/v1/common/upload`
- **方法**: `POST`
- **请求头**:
  - `Content-Type: multipart/form-data`
- **请求体**:
  - `images`: 图片文件数组
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "文件上传成功",
    "data": {
      "urls": [
        "http://your-domain.com/uploads/filename1.jpg",
        "http://your-domain.com/uploads/filename2.jpg"
      ]
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```
- **错误响应**:
  - 文件上传失败:
    ```json
    {
      "code": "A00102",
      "statusCode": 400,
      "msg": "文件上传失败",
      "data": null,
      "timestamp": "2025-01-02 14:11:30.123"
    }
    ```
