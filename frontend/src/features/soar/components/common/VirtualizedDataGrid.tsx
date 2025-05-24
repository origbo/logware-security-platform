import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { FixedSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import memoize from "memoize-one";

// Column definition
export interface GridColumn {
  field: string;
  headerName: string;
  width: number;
  flex?: number;
  headerAlign?: "left" | "center" | "right";
  align?: "left" | "center" | "right";
  sortable?: boolean;
  renderCell?: (params: {
    value: any;
    row: any;
    field: string;
  }) => React.ReactNode;
  valueGetter?: (params: { row: any; field: string }) => any;
}

// Component props
interface VirtualizedDataGridProps {
  columns: GridColumn[];
  rows: Array<any>;
  loading?: boolean;
  error?: string | null;
  rowHeight?: number;
  headerHeight?: number;
  emptyText?: string;
  onRowClick?: (row: any) => void;
  initialSortField?: string;
  initialSortDirection?: "asc" | "desc";
  uniqueIdField?: string;
  containerHeight?: number | string;
}

/**
 * High-performance data grid component that uses virtualization
 * for rendering only the visible rows and cells in large datasets
 */
const VirtualizedDataGrid: React.FC<VirtualizedDataGridProps> = ({
  columns,
  rows,
  loading = false,
  error = null,
  rowHeight = 52,
  headerHeight = 56,
  emptyText = "No data to display",
  onRowClick,
  initialSortField,
  initialSortDirection = "asc",
  uniqueIdField = "id",
  containerHeight = 500,
}) => {
  const theme = useTheme();
  const totalWidth = useRef(columns.reduce((acc, col) => acc + col.width, 0));
  const [sortField, setSortField] = useState<string | undefined>(
    initialSortField
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection
  );

  // Create a memoized function for sorting data
  const sortData = useCallback(
    memoize(
      (
        data: any[],
        sortFieldValue: string | undefined,
        sortDirValue: "asc" | "desc"
      ) => {
        if (!sortFieldValue) return data;

        return [...data].sort((a, b) => {
          // Get values based on the sort field
          const column = columns.find((col) => col.field === sortFieldValue);

          let valueA = column?.valueGetter
            ? column.valueGetter({ row: a, field: sortFieldValue })
            : a[sortFieldValue];

          let valueB = column?.valueGetter
            ? column.valueGetter({ row: b, field: sortFieldValue })
            : b[sortFieldValue];

          // Handle undefined or null values
          if (valueA == null) valueA = "";
          if (valueB == null) valueB = "";

          // Perform the sort
          if (typeof valueA === "string" && typeof valueB === "string") {
            return sortDirValue === "asc"
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          }

          return sortDirValue === "asc"
            ? valueA > valueB
              ? 1
              : -1
            : valueA < valueB
            ? 1
            : -1;
        });
      }
    ),
    [columns]
  );

  // Apply sorting to data
  const sortedRows = sortData(rows, sortField, sortDirection);

  // Handle sort request
  const handleSortClick = (field: string) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  // Cell renderer function - renders individual grid cells
  const Cell = React.memo(({ columnIndex, rowIndex, style }: any) => {
    const column = columns[columnIndex];
    const row = sortedRows[rowIndex];
    const value = column.valueGetter
      ? column.valueGetter({ row, field: column.field })
      : row[column.field];

    const cellContent = column.renderCell
      ? column.renderCell({ value, row, field: column.field })
      : value;

    return (
      <div
        style={{
          ...style,
          padding: theme.spacing(1, 2),
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent:
            column.align === "center"
              ? "center"
              : column.align === "right"
              ? "flex-end"
              : "flex-start",
          backgroundColor:
            rowIndex % 2 === 0
              ? theme.palette.background.default
              : theme.palette.background.paper,
          cursor: onRowClick ? "pointer" : "default",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
        onClick={() => onRowClick && onRowClick(row)}
      >
        {cellContent}
      </div>
    );
  });

  // Empty state
  if (!loading && !error && (!rows || rows.length === 0)) {
    return (
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    align={column.headerAlign || column.align || "left"}
                    style={{ width: column.width }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          </Table>
          <Box
            sx={{
              p: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
            }}
          >
            <Typography variant="body1" color="textSecondary">
              {emptyText}
            </Typography>
          </Box>
        </TableContainer>
      </Paper>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    align={column.headerAlign || column.align || "left"}
                    style={{ width: column.width }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          </Table>
          <Box
            sx={{
              p: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
              flexDirection: "column",
            }}
          >
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              Loading data...
            </Typography>
          </Box>
        </TableContainer>
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    align={column.headerAlign || column.align || "left"}
                    style={{ width: column.width }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          </Table>
          <Box
            sx={{
              p: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
              color: theme.palette.error.main,
            }}
          >
            <Typography variant="body1" color="inherit">
              {error}
            </Typography>
          </Box>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        {/* Table Header */}
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.headerAlign || column.align || "left"}
                  sx={{
                    minWidth: column.width,
                    maxWidth: column.width,
                    width: column.width,
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortField === column.field}
                      direction={
                        sortField === column.field ? sortDirection : "asc"
                      }
                      onClick={() => handleSortClick(column.field)}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>

        {/* Virtualized Grid */}
        <Box sx={{ height: containerHeight }}>
          <AutoSizer>
            {({ width, height }: { width: number; height: number }) => (
              <Grid
                columnCount={columns.length}
                columnWidth={(index: number) => columns[index].width}
                height={height}
                rowCount={sortedRows.length}
                rowHeight={() => rowHeight}
                width={width}
                itemData={{
                  columns,
                  rows: sortedRows,
                  onRowClick,
                }}
              >
                {Cell}
              </Grid>
            )}
          </AutoSizer>
        </Box>
      </TableContainer>
    </Paper>
  );
};

export default React.memo(VirtualizedDataGrid);
