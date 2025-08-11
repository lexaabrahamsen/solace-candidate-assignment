"use client";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { formatPhone } from "@/utils/formatPhone";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

type Advocate = {
  id?: string;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string;
};

export const InternalStyledDataGrid = styled(DataGrid)(({ theme }) => ({
  backgroundColor: "white",
  border: "1px solid #EEEBE8",
  padding: "0.75rem",
  borderRadius: ".75rem",
  boxShadow:
    "0px 1px 10px rgba(55, 55, 55, 0.06), 0px 1px 6px rgba(55, 55, 55, 0.04)",
  "& .MuiDataGrid-columnSeparator": { display: "none" },
  "& .MuiDataGrid-cell": {
    borderBottom: "1px solid #EEEBE8",
    outline: "none !important",
    fontSize: theme.typography.body2.fontSize,
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
    outline: "none !important",
  },
  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: "inherit !important",
  },
  "& .MuiDataGrid-columnHeaders": {
    borderBottom: "1px solid #EEEBE8",
    fontWeight: 700,
  },
  "& .MuiDataGrid-row:hover": {
    cursor: "pointer",
  },
  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
    {
      outline: "none",
    },
  "& .MuiDataGrid-columnHeader.MuiDataGrid-columnHeader--sorted": {
    backgroundColor: "inherit", // Optional: remove green background when sorted
  },
  "& .MuiDataGrid-columnHeader": {
    // Optional: remove background highlight on click
    backgroundColor: "inherit",
  },
}));

const avatarUrlFor = (first: string, last: string) =>
  `https://i.pravatar.cc/96?u=${encodeURIComponent(`${first}-${last}`)}`;

// if image fails or you prefer no network call:
const initials = (first = "", last = "") =>
  `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

const degreeStyles: Record<string, { bg: string; border: string }> = {
  PHD: { bg: "#E6FAF2", border: "#2B7A67" }, // green-ish
  MSW: { bg: "#FFE9C2", border: "#8C6500" }, // yellow-ish
  MD: { bg: "#DDF3FB", border: "#2F7D88" }, // blue-ish
  DEFAULT: { bg: "#eceff1", border: "#b0bec5" },
};

const columns: GridColDef[] = [
  {
    field: "firstName",
    headerName: "First Name",
    flex: 1.6,
    sortable: true,
    renderCell: (params) => {
      const { firstName, lastName } = params.row;
      return (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Avatar
            alt={`${firstName} ${lastName}`}
            src={avatarUrlFor(firstName, lastName)}
            sx={{ width: 32, height: 32 }}
          >
            {(firstName?.[0] ?? "") + (lastName?.[0] ?? "")}
          </Avatar>
          <Typography variant="body2" noWrap>
            {firstName}
          </Typography>
        </Stack>
      );
    },
  },
  { field: "lastName", headerName: "Last Name", flex: 1 },
  { field: "city", headerName: "City", flex: 1 },
  {
    field: "degree",
    headerName: "Degree",
    flex: 1,
    renderCell: (params) => {
      const v = String(params.value ?? "");
      const key = v.trim().toUpperCase();
      const s = degreeStyles[key] ?? degreeStyles.DEFAULT;
      return (
        <Chip
          label={v}
          size="small"
          variant="outlined"
          sx={{ bgcolor: s.bg, borderColor: s.border, color: s.border }}
        />
      );
    },
  },
  {
    field: "specialties",
    headerName: "Specialties",
    flex: 2,
    sortable: false,
    valueGetter: (p) => (p.row.specialties ?? []).join(", "),
  },
  {
    field: "yearsOfExperience",
    headerName: "Years",
    width: 160,
    type: "number",
    sortComparator: (a, b) => Number(a) - Number(b), // keep numeric sort
    renderCell: (params) => {
      const years = Number(params.value ?? 0);
      return (
        <>
          <Stack direction="column" alignItems="flex-end">
            <Typography variant="body2">{years} yrs</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              {years >= 10 && (
                <>
                  <VerifiedUserOutlinedIcon
                    sx={{ fontSize: 12, color: "#bc7d06" }}
                  />
                  <Typography
                    variant="caption"
                    gutterBottom
                    noWrap
                    sx={{ fontSize: 12, color: "#bc7d06" }}
                  >
                    Expert
                  </Typography>
                </>
              )}
            </Stack>
          </Stack>
        </>
      );
    },
  },
  {
    field: "phoneNumber",
    headerName: "Phone",
    flex: 1,
    valueFormatter: ({ value }) => formatPhone(String(value)),
  },
];

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const loadAdvocates = async () => {
      try {
        const response = await fetch("/api/advocates");
        const jsonResponse: { data?: Advocate[] } = await response.json();
        const loadAdvocates: Advocate[] = jsonResponse.data ?? [];
        setAdvocates(loadAdvocates);
        setFilteredAdvocates(loadAdvocates);
      } catch (error) {
        console.error("Error fetching advocates:", error);
        setAdvocates([]);
        setFilteredAdvocates([]);
      }
    };

    loadAdvocates();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    console.log("searching for:", newSearchTerm);
    setSearchTerm(newSearchTerm);

    const normalizedSearchTerm = newSearchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      setFilteredAdvocates(advocates);
      return;
    }

    const filteredAdvocates = advocates.filter((advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(normalizedSearchTerm) ||
        advocate.lastName.toLowerCase().includes(normalizedSearchTerm) ||
        advocate.city.toLowerCase().includes(normalizedSearchTerm) ||
        advocate.degree.toLowerCase().includes(normalizedSearchTerm) ||
        advocate.specialties.some((s) =>
          s.toLowerCase().includes(normalizedSearchTerm)
        ) ||
        advocate.yearsOfExperience.toString().includes(normalizedSearchTerm)
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const handleResetClick = () => {
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <Typography variant="h3">Solace Advocates</Typography>
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term"></span>
        </p>
        <input
          style={{ border: "1px solid black" }}
          onChange={handleSearchChange}
          value={searchTerm}
          placeholder="Search by first name, last name, city, degree, specialties, or years
          of experience"
          aria-label="Search Advocates"
        />
        <Button onClick={handleResetClick} variant="contained" color="primary">
          Reset Search
        </Button>
      </div>
      <Box sx={{ mb: 8 }}>
        <InternalStyledDataGrid
          rows={filteredAdvocates}
          getRowId={(row) => row.id ?? row.phoneNumber}
          columns={columns}
          pageSize={20}
          // rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          aria-label="Advocates Data Grid"
          autoHeight
        />
      </Box>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => {
            const rowKey =
              advocate.id ??
              advocate.phoneNumber ??
              `${advocate.firstName}-${advocate.lastName}`;
            return (
              <tr key={rowKey}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map((s, i) => (
                    // <div key={advocate.id}>{s}</div>
                    <div
                      key={`${advocate.id ?? advocate.phoneNumber}-${s}-${i}`}
                    >
                      {s}
                    </div>
                  ))}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
