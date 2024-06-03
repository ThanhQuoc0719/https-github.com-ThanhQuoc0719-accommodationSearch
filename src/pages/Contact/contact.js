import { Button, Input, notification } from "antd";
import React, { useState } from "react";
import axiosClient from "../../apis/axiosClient";
import "./contact.css";

const { TextArea } = Input;

const Contact = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/contacts", formData);
      notification.success({
        message: "Success",
        description: "Contact created successfully",
      });
      setFormData({
        full_name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to create contact",
      });
    }
  };
  
  return (
    <div id="container" className="py-5">
      <div className="container mx-auto">
        <h3 className="text-center text-3xl mb-5">Liên hệ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12094.57348593182!2d-74.00599512526003!3d40.72586666928451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2598f988156a9%3A0xd54629bdf9d61d68!2sBroadway-Lafayette%20St!5e0!3m2!1spl!2spl!4v1624523797308!5m2!1spl!2spl"
              className="h-96 w-full"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <Input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Họ tên"
                className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Địa chỉ email"
                className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <Input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Chủ đề"
                className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <TextArea
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Nội dung"
                className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <Button
                type="primary"
                htmlType="submit"
              >
                Hoàn thành
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
