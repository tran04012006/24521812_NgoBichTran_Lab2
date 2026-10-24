
import "./App.css";

import DataGrid from "./components/DataGrid";

import type {
  ColumnDef,
} from "./types/data-grid-contract";

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

const employeeColumns: ColumnDef<Employee>[] = [
  {
    header: "ID",
    accessorKey: "id",
    sortable: true,
  },
  {
    header: "Name",
    accessorKey: "name",
    sortable: true,
  },
  {
    header: "Department",
    accessorKey: "department",
    sortable: true,
  },
  {
    header: "Email",
    accessorKey: "email",
    sortable: false,
  },
];

function App() {
  return (
    <main className="app">
      <h1>Employee Management</h1>

      <p>Employee information management system</p>

      <DataGrid<Employee>
        data={employees}
        columns={employeeColumns}
        ariaLabel="Employee List"
      />
    </main>
  );
}

export default App;
