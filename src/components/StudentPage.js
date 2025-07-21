import React, { useEffect, useState } from "react";
import { Input, Button, Table, message, Modal, Form } from "antd";
import ParentService from "../services/ParentService";
import ProfileService from "../services/ProfileService";
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
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addEmail)) {
      message.error("Please enter a valid email address.");
      return;
    }
    
    setAddLoading(true);
    try {
      // Check if email exists and belongs to a STUDENT
      const studentCheck = await ProfileService.checkStudentEmailExists(addEmail);
      
      if (!studentCheck.exists) {
        message.error(studentCheck.message);
        setAddLoading(false);
        return;
      }
      
      if (!studentCheck.isStudent) {
        message.error(studentCheck.message);
        setAddLoading(false);
        return;
      }

      // If all validations pass, proceed with adding student
      const res = await ParentService.addStudentToParent(parentId, addEmail);
      message.success(res);
      setAddModalVisible(false);
      setAddEmail("");
      fetchStudents();
    } catch (error) {
      console.error("Add student error:", error);
      
      // Handle specific error cases
      let errorMessage = "Failed to add student.";
      
      if (error.message) {
        const errorText = error.message.toLowerCase();
        
        // Check for various "not found" error patterns
        if (errorText.includes('not found') || 
            errorText.includes('does not exist') || 
            errorText.includes('no user found') ||
            errorText.includes('user not found') ||
            errorText.includes('no such user') ||
            errorText.includes('student not found')) {
          errorMessage = `There is no student with email "${addEmail}" in the database.`;
        } else if (errorText.includes('already') && errorText.includes('parent')) {
          errorMessage = "This student is already linked to a parent.";
        } else if (errorText.includes('already') && errorText.includes('child')) {
          errorMessage = "This student is already your child.";
        } else if (errorText.includes('unauthorized') || errorText.includes('permission')) {
          errorMessage = "You don't have permission to add this student.";
        } else if (errorText.includes('invalid email')) {
          errorMessage = "Please enter a valid email address.";
        } else {
          // Use the original error message if it's meaningful
          errorMessage = error.message;
        }
      }
      
      message.error(errorMessage);
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