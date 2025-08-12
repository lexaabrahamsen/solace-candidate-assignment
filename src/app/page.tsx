"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  Grid,
  Slider,
  Stack,
  TextField,
  Typography,
  styled,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"; // ← new icon
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatPhone } from "@/utils/formatPhone";

// ---------- Types ----------
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

type ActiveFilters = {
  degrees: string[];
  specialties: string[];
  minYears?: number;
  expertOnly: boolean;
};

// ---------- Shared frame styles (match quick filter) ----------
const FRAME_BORDER = "#E3E0DD";
const FRAME_SHADOW = "0px 2px 4px rgba(55, 55, 55, 0.08)";
const FRAME_RADIUS = ".75rem";

// ---------- Styled DataGrid ----------
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
  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: "inherit !important",
  },
  "& .MuiDataGrid-columnHeaders": {
    borderBottom: "1px solid #EEEBE8",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
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
    backgroundColor: "inherit",
  },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: "inherit",
  },
}));

// Quick filter styled to establish the “frame” look
export const StyledGridToolbarQuickFilter = styled(GridToolbarQuickFilter)(
  ({ theme }) => ({
    "& .MuiInputBase-root": {
      height: "2.25rem",
      borderRadius: FRAME_RADIUS,
      backgroundColor: "#fff",
      boxShadow: FRAME_SHADOW,
    },
    "& .MuiOutlinedInput-root": {
      paddingRight: theme.spacing(1),
      "& fieldset": { borderColor: FRAME_BORDER },
      "&:hover fieldset": { borderColor: "#c9c6c3" },
      "&.Mui-focused fieldset": { borderColor: "#347866", borderWidth: 1 },
    },
    "& input": { padding: "8px 12px" },
  })
);

// ---------- Styled components ----------
// Primary CTA (contained)
export const StyledContainedButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  color: "#fff",
  backgroundColor: "#285e50",
  border: "1px solid #347866",
  borderRadius: 10,
  padding: ".75rem 2rem",
  fontFamily: "var(--font-lato), " + theme.typography.fontFamily,
  fontSize: "1rem",
  fontWeight: 400,
  lineHeight: 1.5,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#347866",
    boxShadow: "none",
  },
  "&:focus-visible": {
    outline: "none",
    boxShadow: "0 0 0 3px rgba(52,120,102,0.3)",
  },
  "&.Mui-disabled": {
    backgroundColor: "#c9d7d2",
    color: "#fff",
  },
}));

// Secondary CTA (outlined)
export const StyledOutlinedButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  color: "#285e50",
  backgroundColor: "#fff",
  border: "1px solid #347866",
  borderRadius: 10,
  padding: ".625rem 1.25rem",
  fontFamily: "var(--font-lato), " + theme.typography.fontFamily,
  fontSize: "0.95rem",
  fontWeight: 400,
  lineHeight: 1.5,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "rgba(52,120,102,0.06)",
    borderColor: "#285e50",
  },
  "&:focus-visible": {
    outline: "none",
    boxShadow: "0 0 0 3px rgba(52,120,102,0.25)",
  },
}));

// Inputs inside drawer that should match the quick filter
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    height: "2.25rem",
    borderRadius: FRAME_RADIUS,
    backgroundColor: "#fff",
    boxShadow: FRAME_SHADOW,
  },
  "& .MuiOutlinedInput-root": {
    paddingRight: theme.spacing(1),
    "& fieldset": { borderColor: FRAME_BORDER },
    "&:hover fieldset": { borderColor: "#c9c6c3" },
    "&.Mui-focused fieldset": { borderColor: "#347866", borderWidth: 1 },
  },
  "& .MuiInputBase-input": { padding: "8px 12px" },
}));

// Accordions that match the same frame
const StyledAccordion = styled(Accordion)(() => ({
  border: `1px solid ${FRAME_BORDER}`,
  borderRadius: FRAME_RADIUS,
  boxShadow: FRAME_SHADOW,
  "&::before": { display: "none" }, // remove default divider
  overflow: "hidden",
  marginBottom: 12,
}));

// ---------- Helpers ----------
const avatarUrlFor = (first: string, last: string) =>
  `https://i.pravatar.cc/96?u=${encodeURIComponent(`${first}-${last}`)}`;

// ---------- Overlays ----------
const GridLoadingOverlay = () => (
  <Stack
    role="status"
    aria-live="polite"
    alignItems="center"
    justifyContent="center"
    sx={{ height: 240 }}
    spacing={1}
  >
    <CircularProgress size={24} />
    <Typography variant="body2">Loading advocates…</Typography>
  </Stack>
);

const GridNoRowsOverlay = () => (
  <Stack
    role="status"
    aria-live="polite"
    alignItems="center"
    justifyContent="center"
    sx={{ height: 240 }}
    spacing={1}
  >
    <InboxOutlinedIcon aria-hidden="true" />
    <Typography variant="body2">No advocates to display</Typography>
  </Stack>
);

const GridNoResultsOverlay = ({ searchTerm }: { searchTerm: string }) => (
  <Stack
    role="status"
    aria-live="polite"
    alignItems="center"
    justifyContent="center"
    sx={{ height: 240 }}
    spacing={1}
  >
    <SearchOffOutlinedIcon aria-hidden="true" />
    <Typography variant="body2">No matches for “{searchTerm}”</Typography>
  </Stack>
);

// ---------- Toolbar (Quick Filter + Radio + Filter button + Chips) ----------
type AdvocatesToolbarProps = {
  onOpenFilterDrawer: () => void;
  filters: ActiveFilters;
  setExpertOnly: (on: boolean) => void;
  clearFilter: (type: keyof ActiveFilters, value?: string) => void;
  quickSearch?: string;
  onClearQuickSearch: () => void;
};

function AdvocatesToolbar({
  onOpenFilterDrawer,
  filters,
  setExpertOnly,
  clearFilter,
  quickSearch,
  onClearQuickSearch,
}: AdvocatesToolbarProps) {
  const filterCount =
    (filters.degrees?.length ?? 0) +
    (filters.specialties?.length ?? 0) +
    (filters.minYears ? 1 : 0) +
    (filters.expertOnly ? 1 : 0);

  const experienceValue = filters.expertOnly ? "expert" : "all";

  return (
    <Box sx={{ p: 1 }}>
      <GridToolbarContainer
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {/* left cluster: search + radio */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <StyledGridToolbarQuickFilter variant="outlined" debounceMs={200} />
          <FormControl component="fieldset" sx={{ m: 0 }}>
            <RadioGroup
              row
              aria-label="Experience Filter"
              name="experience-filter"
              value={experienceValue}
              onChange={(_, val) => setExpertOnly(val === "expert")}
            >
              <FormControlLabel
                value="all"
                control={<Radio size="small" />}
                label="All"
              />
              <FormControlLabel
                value="expert"
                control={<Radio size="small" />}
                label="Expert (10+ yrs)"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* right: filter button */}
        <Box sx={{ marginLeft: "auto" }}>
          <StyledOutlinedButton
            size="small"
            variant="outlined"
            onClick={onOpenFilterDrawer}
            startIcon={<FilterListOutlinedIcon />} // ← updated icon
            sx={{ borderRadius: "6px", textTransform: "none" }}
          >
            Filter {filterCount ? `(${filterCount})` : ""}
          </StyledOutlinedButton>
        </Box>
      </GridToolbarContainer>

      {/* Active filter chips */}
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        sx={{ mt: 2 }}
      >
        {quickSearch ? (
          <Chip
            label={`Search: ${quickSearch}`}
            onDelete={onClearQuickSearch}
            size="small"
            sx={{ borderRadius: "6px", height: 30 }}
          />
        ) : null}

        {filters.expertOnly && (
          <Chip
            label="Expert only"
            onDelete={() => setExpertOnly(false)}
            size="small"
            sx={{ borderRadius: "6px", height: 30 }}
          />
        )}

        {filters.degrees.map((d) => (
          <Chip
            key={`deg-${d}`}
            label={`Degree: ${d}`}
            onDelete={() => clearFilter("degrees", d)}
            size="small"
            sx={{ borderRadius: "6px", height: 30 }}
          />
        ))}

        {filters.specialties.map((s) => (
          <Chip
            key={`spec-${s}`}
            label={s}
            onDelete={() => clearFilter("specialties", s)}
            size="small"
            sx={{ borderRadius: "6px", height: 30 }}
          />
        ))}

        {typeof filters.minYears === "number" ? (
          <Chip
            label={`${filters.minYears}+ yrs`}
            onDelete={() => clearFilter("minYears")}
            size="small"
            sx={{ borderRadius: "6px", height: 30 }}
          />
        ) : null}
      </Stack>
    </Box>
  );
}

// ---------- Filter Drawer ----------
type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  onApply: (next: ActiveFilters) => void;
  current: ActiveFilters;
  degreeOptions: string[];
  specialtyOptions: string[];
};

function AdvocatesFilterDrawer({
  open,
  onClose,
  onApply,
  current,
  degreeOptions,
  specialtyOptions,
}: FilterDrawerProps) {
  const [local, setLocal] = useState<ActiveFilters>(current);
  useEffect(() => setLocal(current), [current]);

  const degreeCount = local.degrees.length;
  const specialtyCount = local.specialties.length;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 426,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fafafa",
        }}
      >
        <Box sx={{ p: 2, pb: 1, flex: 1, overflowY: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>

          <StyledAccordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                Degree{degreeCount ? ` (${degreeCount})` : ""}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Autocomplete
                multiple
                options={degreeOptions}
                value={local.degrees}
                onChange={(_, v) => setLocal((s) => ({ ...s, degrees: v }))}
                renderInput={(params) => (
                  <TextField
                    sx={{ borderRadius: "8px" }}
                    {...params}
                    label="Select degrees"
                    size="small"
                  />
                )}
              />
            </AccordionDetails>
          </StyledAccordion>

          <StyledAccordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                Specialties{specialtyCount ? ` (${specialtyCount})` : ""}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Autocomplete
                multiple
                options={specialtyOptions}
                value={local.specialties}
                onChange={(_, v) => setLocal((s) => ({ ...s, specialties: v }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select specialties"
                    size="small"
                  />
                )}
              />
            </AccordionDetails>
          </StyledAccordion>

          <StyledAccordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Years of Experience</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ minWidth: 90 }}>
                  Min years
                </Typography>
                <Slider
                  min={0}
                  max={40}
                  step={1}
                  value={local.minYears ?? 0}
                  onChange={(_, v) =>
                    setLocal((s) => ({ ...s, minYears: Number(v) || 0 }))
                  }
                  valueLabelDisplay="auto"
                />
              </Stack>
            </AccordionDetails>
          </StyledAccordion>
        </Box>

        {/* sticky bottom toolbar */}
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${FRAME_BORDER}`,
            bgcolor: "#fff",
            boxShadow: FRAME_SHADOW,
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            onClick={() =>
              setLocal({
                degrees: [],
                specialties: [],
                minYears: undefined,
                expertOnly: current.expertOnly, // keep expertOnly as global (toolbar)
              })
            }
            sx={{ textTransform: "none" }}
          >
            Clear all
          </Button>
          <Box sx={{ flex: 1 }} />
          <StyledOutlinedButton variant="outlined" onClick={onClose}>
            Cancel
          </StyledOutlinedButton>
          <StyledContainedButton
            variant="contained"
            onClick={() => {
              onApply(local);
              onClose();
            }}
          >
            Apply
          </StyledContainedButton>
        </Box>
      </Box>
    </Drawer>
  );
}

// ---------- Columns ----------
const columns: GridColDef<Advocate>[] = [
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
            alt=""
            aria-hidden="true"
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
      return (
        <Typography
          variant="body2"
          noWrap
          sx={{ mr: 1, display: "inline-flex", alignItems: "center" }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              display: "inline-block",
              background: "#3f937c",
              marginRight: 6,
            }}
          />
          {v}
        </Typography>
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
    width: 170,
    type: "number",
    sortComparator: (a, b) => Number(a) - Number(b),
    renderCell: (params) => {
      const years = Number(params.value ?? 0);
      return (
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="body2">{years} yrs</Typography>
          {years >= 10 && (
            <VerifiedUserOutlinedIcon
              sx={{ fontSize: 14, color: "#bc7d06" }}
              aria-hidden="true"
            />
          )}
        </Stack>
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

// ---------- Page ----------
export default function Home() {
  const [allAdvocates, setAllAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // structured filters
  const [filters, setFilters] = useState<ActiveFilters>({
    degrees: [],
    specialties: [],
    minYears: undefined,
    expertOnly: false,
  });

  // Drawer open
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Quick filter (free text) via DataGrid filterModel
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  // Fetch
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/advocates", { signal: ctrl.signal });
        const json: { data?: Advocate[] } = await response.json();
        setAllAdvocates(json.data ?? []);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") console.error(e);
        setAllAdvocates([]);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // Options for drawer
  const degreeOptions = useMemo(
    () =>
      Array.from(new Set(allAdvocates.map((a) => a.degree))).filter(Boolean),
    [allAdvocates]
  );
  const specialtyOptions = useMemo(
    () =>
      Array.from(
        new Set(allAdvocates.flatMap((a) => a.specialties ?? []))
      ).sort(),
    [allAdvocates]
  );

  // Apply structured filters client-side
  const filteredRows = useMemo(() => {
    return allAdvocates.filter((a) => {
      if (filters.expertOnly && a.yearsOfExperience < 10) return false;
      if (filters.degrees.length && !filters.degrees.includes(a.degree))
        return false;
      if (filters.specialties.length) {
        const s = (a.specialties ?? []).map((x) => x.toLowerCase());
        const anyMatch = filters.specialties.some((f) =>
          s.includes(f.toLowerCase())
        );
        if (!anyMatch) return false;
      }
      if (
        typeof filters.minYears === "number" &&
        a.yearsOfExperience < filters.minYears
      )
        return false;
      return true;
    });
  }, [allAdvocates, filters]);

  // Toolbar helpers
  const handleClearFilter = (type: keyof ActiveFilters, value?: string) => {
    setFilters((prev) => {
      if (type === "degrees")
        return { ...prev, degrees: prev.degrees.filter((d) => d !== value) };
      if (type === "specialties")
        return {
          ...prev,
          specialties: prev.specialties.filter((s) => s !== value),
        };
      if (type === "minYears") return { ...prev, minYears: undefined };
      if (type === "expertOnly") return { ...prev, expertOnly: false };
      return prev;
    });
  };

  const quickSearch = filterModel.quickFilterValues?.[0] ?? "";
  const clearQuickSearch = () =>
    setFilterModel((m) => ({ ...m, quickFilterValues: [] }));

  return (
    <Grid container component="main" sx={{ p: 6 }}>
      <Grid item xs={12} sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Solace Advocates
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Find the right advocate for your care journey—browse, search, and
          filter by specialty, degree, and years of experience to match your
          needs.
        </Typography>
      </Grid>

      <Grid item xs={12} sx={{ mb: 8 }}>
        <InternalStyledDataGrid
          rows={filteredRows}
          getRowId={(row) => row.id ?? row.phoneNumber}
          columns={columns}
          pageSize={20}
          disableSelectionOnClick
          aria-label="Advocates Data Grid"
          autoHeight
          loading={isLoading}
          components={{
            Toolbar: AdvocatesToolbar,
            LoadingOverlay: GridLoadingOverlay,
            NoRowsOverlay: GridNoRowsOverlay,
            NoResultsOverlay: GridNoResultsOverlay,
          }}
          componentsProps={{
            toolbar: {
              onOpenFilterDrawer: () => setFilterDrawerOpen(true),
              filters,
              setExpertOnly: (on: boolean) =>
                setFilters((f) => ({ ...f, expertOnly: on })),
              clearFilter: handleClearFilter,
              quickSearch,
              onClearQuickSearch: clearQuickSearch,
            },
            noResultsOverlay: { searchTerm: quickSearch },
          }}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          sx={{ minHeight: 420 }}
        />
      </Grid>

      <AdvocatesFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        current={filters}
        degreeOptions={degreeOptions}
        specialtyOptions={specialtyOptions}
        onApply={(next) => setFilters(next)}
      />
    </Grid>
  );
}
