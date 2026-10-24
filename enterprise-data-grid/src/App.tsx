
import { useState } from "react";

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
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const handleRowSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <main className="app">
      <h1>Employee Management</h1>

      <p>Employee information management system</p>

      <DataGrid<Employee>
        data={employees}
        columns={employeeColumns}
        ariaLabel="Employee List"
        onRowSelect={handleRowSelect}
      />

      <section
        className="selection-summary"
        aria-labelledby="selected-employee-heading"
      >
        <h2 id="selected-employee-heading">
          Selected Employee
        </h2>

        {selectedEmployee ? (
          <p>
            Name: {selectedEmployee.name}
            {" | "}
            Department: {selectedEmployee.department}
          </p>
        ) : (
          <p>No employee selected.</p>
        )}
      </section>
    </main>
  );
}

export default App;
