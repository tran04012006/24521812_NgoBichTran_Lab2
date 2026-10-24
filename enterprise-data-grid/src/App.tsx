
import "./App.css";

import type {
  ColumnDef,
  DataGridProps,
} from "./types/data-grid-contract";

// Step 1: Define the data structure
interface Employee {
  id: number;
  name: string;
  department: string;
  email: string;
}

// Step 2: Create sample employee data
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

// Step 3: Define columns using ColumnDef
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

// Step 4: Prepare the DataGrid contract
const employeeGridProps: DataGridProps<Employee> = {
  data: employees,
  columns: employeeColumns,
  ariaLabel: "Employee List",
};

// Step 5: Render the semantic HTML table
function App() {
  const { data, columns, ariaLabel } = employeeGridProps;

  return (
    <main className="app">
      <h1>Employee Management</h1>

      <p>Employee information management system</p>

      <div className="table-container">
        <table aria-label={ariaLabel}>
          <caption>{ariaLabel}</caption>

          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.accessorKey)}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((employee) => (
              <tr key={employee.id}>
                {columns.map((column) => (
                  <td key={String(column.accessorKey)}>
                    {String(
                      employee[column.accessorKey] ?? ""
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default App;
