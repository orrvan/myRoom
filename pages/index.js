import React from 'react';
import Link from 'next/link';
const TenantRegistration = () => {
  function generateOrderId() {
    const now = new Date();
    return now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  }

  /***数据库******************/
  const MongoDBSubmit = async (obj) => {
    console.log(obj);
    const { 
      startDate,
      endDate,
      rentDate, // 新增的交租日期
      phone,
      roomNumber,
      id,
      name,
      paymentMethod,
    } = obj || {};

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        startDate,
        endDate,
        rentDate, // 将交租日期包含在请求中
        phone,
        roomNumber,
        id,
        name,
        paymentMethod,
      }),
    });
  
    const data = await response.json();
    console.log(data);
  };
  /***数据库******************/

  function handleSubmit(event) {
    event.preventDefault();
    const orderId = generateOrderId();
    const formData = {
      id: orderId,
      name: document.getElementById('name').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      rentDate: document.getElementById('rentDate').value, // 获取交租日期
      phone: document.getElementById('phone').value,
      paymentMethod: document.getElementById('paymentMethod').value,
      roomNumber: document.getElementById('roomNumber').value,
    };

    /***数据库******************/
    MongoDBSubmit(formData);
    /***数据库******************/
    
    alert('登记成功！订单ID: ' + orderId);
    document.getElementById('rentalForm').reset();
  }

  return (
    <div className="zone">
      <style jsx>{`
        .zone {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          font-size: 1.1em;
          height: 100vh; /* 使容器填满视口高度 */
          display: flex;
          justify-content: center; /* 水平居中 */
          align-items: center; /* 垂直居中 */
          background-color: #f0f4ff;
        }
        .container {
          margin: 0 auto;
          max-width: 600px;
          width: 100%;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          background-color: #ffffff;
          color: #333;
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #007bff;
        }
        label {
          display: block;
          margin: 10px 0 5px;
        }
        input, select {
          width: 100%;
          padding: 10px;
          margin: 0 auto 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1.1em;
          background-color: #f7f9fc;
          color: #333;
          box-sizing: border-box;
        }
        button {
          width: 100%;
          padding: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.1em;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
        .linktoRoom{
          margin-top:3px
        }
      `}</style>
      <div className="container">
        <h2>租户登记</h2>
        <form id="rentalForm" onSubmit={handleSubmit}>
          <label htmlFor="name">租户姓名</label>
          <input type="text" id="name" name="name" required />

          <label htmlFor="startDate">起租时间</label>
          <input type="date" id="startDate" name="startDate" required />

          <label htmlFor="endDate">到期时间</label>
          <input type="date" id="endDate" name="endDate" required />

          <label htmlFor="rentDate">交租日期</label>
          <input type="date" id="rentDate" name="rentDate" required /> {/* 新增的交租日期 */}

          <label htmlFor="phone">手机号</label>
          <input type="tel" id="phone" name="phone" required />

          <label htmlFor="paymentMethod">付款方式</label>
          <select id="paymentMethod" name="paymentMethod" required>
            <option value="按月支付">按月支付</option>
            <option value="按季度支付">按季度支付</option>
            <option value="按年支付">按年支付</option>
          </select>

          <label htmlFor="roomNumber">房间号</label>
          <input type="text" id="roomNumber" name="roomNumber" required />

          <button type="submit">提交</button>
          <Link href="/room">
                <button className='linktoRoom'>查看房间信息</button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default TenantRegistration;
