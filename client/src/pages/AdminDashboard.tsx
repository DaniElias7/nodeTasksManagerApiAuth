import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { UserService } from '../services/users';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersData = await UserService.getAll();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const updatedUser = await UserService.updateRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: updatedUser.role } : user
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await UserService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) return <div>Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* ... mismo encabezado ... */}
      
      <section className="user-management">
        <h3>User Management</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.id === user?.id} // No permitir auto-edición
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === user?.id}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};