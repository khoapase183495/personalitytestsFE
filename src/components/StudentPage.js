import React, { useEffect, useState } from "react";
import { Input, Button, Table, message, Modal, Form } from "antd";
import ParentService from "../services/ParentService";
import { useAuth } from "../contexts/AuthContext";

function StudentPage() {
  const { user } = useAuth();
  const parentId = user?.id;
  const [students, setStudents] = useState([]);
  const [searchFullname, setSearchFullname] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await ParentService.getChildren(parentId);
      setStudents(data);
    } catch (error) {
      message.error(error.message || "Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  // Filter students by fullname and email
  const filteredStudents = students.filter(student =>
    (searchFullname === "" || (student.fullname || "").toLowerCase().includes(searchFullname.toLowerCase())) &&
    (searchEmail === "" || (student.email || "").toLowerCase().includes(searchEmail.toLowerCase()))
  );

  // Add student handler
  const handleAddStudent = async () => {
    if (!addEmail) {
      message.error("Please enter student email.");
      return;
    }
    setAddLoading(true);
    try {
      const res = await ParentService.addStudentToParent(parentId, addEmail);
      message.success(res);
      setAddModalVisible(false);
      setAddEmail("");
      fetchStudents();
    } catch (error) {
      message.error(error.message || "Failed to add student.");
    } finally {
      setAddLoading(false);
    }
  };

  const columns = [
    { title: "Full Name", dataIndex: "fullname", key: "fullname", render: text => text || "N/A" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Username", dataIndex: "username", key: "username" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Student List</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Input
          placeholder="Search by full name"
          value={searchFullname}
          onChange={e => setSearchFullname(e.target.value)}
          style={{ width: 220 }}
        />
        <Input
          placeholder="Search by email"
          value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)}
          style={{ width: 220 }}
        />
        <Button type="primary" onClick={() => setAddModalVisible(true)}>
          Add Student
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredStudents}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title="Add Student"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddStudent}
        confirmLoading={addLoading}
        okText="Add"
      >
        <Form layout="vertical">
          <Form.Item label="Student Email" required>
            <Input
              value={addEmail}
              onChange={e => setAddEmail(e.target.value)}
              placeholder="Enter student email"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default StudentPage;