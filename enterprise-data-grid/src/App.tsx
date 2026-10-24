
import "./App.css";

interface Employee {
  id: number;
  name: string;
  department: string;
  email: string;
}

const employees: Employee[] = [
  {
    id: 1,
    name: "Nguyen Van An",
    department: "IT",
    email: "an@example.com",
  },
  {
    id: 2,
    name: "Tran Thi Binh",
    department: "HR",
    email: "binh@example.com",
  },
  {
    id: 3,
    name: "Le Minh Cuong",
    department: "Finance",
    email: "cuong@example.com",
  },
];

function App() {
  return (
    <main className="app">
      <h1>Employee Management</h1>

      <p>Employee information management system</p>

      <div className="table-container">
        <table>
          <caption>Employee List</caption>

          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Department</th>
              <th scope="col">Email</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.name}</td>
                <td>{employee.department}</td>
                <td>{employee.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default App;
