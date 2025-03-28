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
  - `page`: 页码，默认 1
  - `limit`: 每页数量，默认 10
  - `name`: 客户名称，支持模糊查询
  - `medicalRecordNumber`: 病历号，精确匹配
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "客户列表获取成功",
    "data": {
      "list": [
        {
          "customerId": "customer_id",
          "name": "客户名称",
          "medicalRecordNumber": "病历号",
          "avatarUrl": "头像URL",
          "remarks": "备注"
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10
      }
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 获取总客户数

- **URL**: `/api/v1/customers/total`
- **方法**: `GET`
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "获取总客户数成功",
    "data": {
      "total": 1234
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 获取某天新增客户数

- **URL**: `/api/v1/customers/new`
- **方法**: `GET`
- **请求参数**:
  - `date`: 日期，格式：YYYY-MM-DD
- **示例请求**:
  ```
  GET /api/v1/customers/new?date=2025-01-01
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "获取新增客户数成功",
    "data": {
      "date": "2025-01-01",
      "count": 5
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```
- **错误响应**:
  ```json
  {
    "code": "A00100",
    "statusCode": 400,
    "msg": "请提供日期参数",
    "data": null,
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 获取客户统计数据

- **URL**: `/api/v1/customers/stats`
- **方法**: `GET`
- **请求参数**:
  - `year`: 年份，如：2025
  - `month`: 月份，如：1-12（需要同时提供year）
  - `date`: 具体日期，格式：YYYY-MM-DD
  - `startDate`: 开始日期，格式：YYYY-MM-DD
  - `endDate`: 结束日期，格式：YYYY-MM-DD
- **示例请求**:
  ```
  // 获取总客户数
  GET /api/v1/customers/stats

  // 获取2025年的客户数
  GET /api/v1/customers/stats?year=2025

  // 获取2025年1月的客户数
  GET /api/v1/customers/stats?year=2025&month=1

  // 获取指定日期的客户数
  GET /api/v1/customers/stats?date=2025-01-01

  // 获取日期区间的客户数
  GET /api/v1/customers/stats?startDate=2025-01-01&endDate=2025-01-31
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "获取客户统计数据成功",
    "data": {
      "total": 100,
      "dailyStats": [  // 当查询范围不超过31天时返回
        {
          "date": "2025-01-01",
          "count": 5
        },
        {
          "date": "2025-01-02",
          "count": 3
        }
      ]
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

## 上传API

### 上传图片

- **URL**: `/api/v1/upload`
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

## 字典API

### 创建字典

- **URL**: `/api/v1/common/dicts`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "type": "string",      // 必填，字典类型
    "code": "string",      // 必填，字典代码
    "name": "string",      // 必填，字典名称
    "sort": "number",      // 可选，排序号
    "remarks": "string"    // 可选，备注
  }
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 201,
    "msg": "字典创建成功",
    "data": {
      "id": "dict_id",
      "type": "项目类型",
      "code": "facial",
      "name": "美容",
      "sort": 1,
      "remarks": "面部护理项目"
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 获取字典列表

- **URL**: `/api/v1/common/dicts`
- **方法**: `GET`
- **请求参数**:
  - `type`: 字典类型
  - `code`: 字典代码
  - `name`: 字典名称
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "字典列表获取成功",
    "data": [
      {
        "id": "dict_id",
        "type": "项目类型",
        "code": "facial",
        "name": "美容",
        "sort": 1,
        "remarks": "面部护理项目"
      }
    ],
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

## 消费记录API

### 创建消费记录

- **URL**: `/api/v1/purchaseRecords`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    // 方式1：使用已有客户ID
    "customerId": "string",  // 可选，现有客户ID
    
    // 方式2：创建新客户
    "customerInfo": {        // 可选，新客户信息
      "name": "string",
      "medicalRecordNumber": "string",
      "avatarUrl": "string",
      "remarks": "string"
    },

    // 消费记录信息
    "purchaseDate": "2025-01-02",  // 必填，消费日期
    "purchaseAmount": "number",     // 必填，消费金额
    "purchaseType": "string",       // 必填，消费类型
    "purchaseItem": "string",       // 必填，消费项目
    "purchaseFactItem": "string",   // 可选，实际消费项目
    "remarks": "string",            // 可选，备注
    "createdBy": "string"          // 必填，创建者ID
  }
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 201,
    "msg": "消费记录创建成功",
    "data": {
      "id": "purchase_record_id",
      "customerId": "customer_id",
      "purchaseDate": "2025-01-02",
      "purchaseAmount": 1000,
      "purchaseType": "美容",
      "purchaseItem": "面部护理",
      "purchaseFactItem": "深层清洁",
      "remarks": "首次消费",
      "createdAt": "2025-01-02 14:11:30.123"
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 获取消费记录列表

- **URL**: `/api/v1/purchaseRecords`
- **方法**: `GET`
- **请求参数**:
  - `page`: 页码，默认 1
  - `limit`: 每页数量，默认 10
  - `customerId`: 客户ID，精确匹配
  - `customerName`: 客户名称，模糊查询
  - `medicalRecordNumber`: 病历号，精确匹配
  - `purchaseType`: 消费类型
  - `purchaseItem`: 消费项目
  - `startDate`: 开始日期，格式：YYYY-MM-DD
  - `endDate`: 结束日期，格式：YYYY-MM-DD
  - `sortField`: 排序字段，可选值：purchaseDate/purchaseAmount
  - `sortOrder`: 排序方向，可选值：asc（升序）/desc（降序），默认 desc
- **示例请求**:
  ```
  // 查询2025年1月的消费记录，按金额升序
  GET /api/v1/purchaseRecords?startDate=2025-01-01&endDate=2025-01-31&sortField=purchaseAmount&sortOrder=asc

  // 查询某客户的消费记录，按日期降序
  GET /api/v1/purchaseRecords?customerId=123&sortField=purchaseDate&sortOrder=desc
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "消费记录列表获取成功",
    "data": {
      "list": [
        {
          "purchaseId": "purchase_record_id",
          "customerInfo": {
            "customerId": "customer_id",
            "name": "张三",
            "avatarUrl": "http://...",
            "medicalRecordNumber": "MRN001"
          },
          "purchaseDate": "2025-01-02",
          "purchaseAmount": 1000,
          "purchaseType": "美容",
          "purchaseItem": "面部护理",
          "purchaseFactItem": "深层清洁",
          "remarks": "首次消费"
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10
      }
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 更新消费记录

- **URL**: `/api/v1/purchaseRecords/:id`
- **方法**: `PUT`
- **请求体**:
  ```json
  {
    "purchaseDate": "2025-01-02",  // 可选，消费日期
    "purchaseAmount": "number",     // 可选，消费金额
    "purchaseType": "string",       // 可选，消费类型
    "purchaseItem": "string",       // 可选，消费项目
    "purchaseFactItem": "string",   // 可选，实际消费项目
    "remarks": "string",            // 可选，备注
    "updatedBy": "string"          // 必填，更新者ID
  }
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "消费记录更新成功",
    "data": {
      "id": "purchase_record_id",
      "purchaseDate": "2025-01-02",
      "purchaseAmount": 1000,
      "purchaseType": "美容",
      "purchaseItem": "面部护理",
      "purchaseFactItem": "深层清洁",
      "remarks": "已更新"
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 删除消费记录

- **URL**: `/api/v1/purchaseRecords/:id`
- **方法**: `DELETE`
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "消费记录删除成功",
    "data": null,
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 导入消费记录

- **URL**: `/api/v1/purchaseRecords/import`
- **方法**: `POST`
- **请求头**:
  - `Content-Type: multipart/form-data`
- **请求体**:
  - `file`: Excel文件（支持的列：日期、姓名、病案号、项目、实际、类型、金额）
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "数据导入成功",
    "data": {
      "total": 10,
      "message": "成功导入 10 条记录"
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```
- **错误响应**:
  ```json
  {
    "code": "A00100",
    "statusCode": 400,
    "msg": "导入失败: 文件格式错误",
    "data": null,
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```

### 获取消费统计数据

- **URL**: `/api/v1/purchaseRecords/stats`
- **方法**: `GET`
- **请求参数**:
  - `year`: 年份，如：2025
  - `month`: 月份，如：1-12（需要同时提供year）
  - `date`: 具体日期，格式：YYYY-MM-DD
  - `startDate`: 开始日期，格式：YYYY-MM-DD
  - `endDate`: 结束日期，格式：YYYY-MM-DD
  - `purchaseType`: 消费类型（可选）
  - `groupBy`: 时间分组方式（可选）：date/month/year，默认 date
- **示例请求**:
  ```
  // 获取2025年的月度消费统计
  GET /api/v1/purchaseRecords/stats?year=2025&groupBy=month

  // 获取某个时间段的日消费统计
  GET /api/v1/purchaseRecords/stats?startDate=2025-01-01&endDate=2025-01-31&groupBy=date
  ```
- **成功响应**:
  ```json
  {
    "code": "000000",
    "statusCode": 200,
    "msg": "获取消费统计数据成功",
    "data": {
      "totalAmount": 50000,
      "count": 100,
      "typeStats": [
        {
          "type": "injection",
          "amount": 30000,
          "count": 60
        },
        {
          "type": "skin",
          "amount": 20000,
          "count": 40
        }
      ],
      "details": [
        {
          "time": "2025-01-01",
          "total": 5000,
          "count": 10,
          "types": [
            {
              "type": "injection",
              "amount": 3000,
              "count": 6
            },
            {
              "type": "skin",
              "amount": 2000,
              "count": 4
            }
          ]
        },
        {
          "time": "2025-01-02",
          "total": 3000,
          "count": 6,
          "types": [
            {
              "type": "injection",
              "amount": 2000,
              "count": 4
            },
            {
              "type": "skin",
              "amount": 1000,
              "count": 2
            }
          ]
        }
      ]
    },
    "timestamp": "2025-01-02 14:11:30.123"
  }
  ```
