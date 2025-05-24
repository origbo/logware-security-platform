import React, { useState, useCallback } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Skeleton,
  Box,
  useTheme,
} from "@mui/material";
import { AutoSizer, List, ListRowProps } from "react-virtualized";

// Column definition
export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "right" | "center";
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
}

// Component props
interface VirtualizedDataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  defaultSortBy?: string;
  defaultSortDirection?: "asc" | "desc";
  rowHeight?: number;
  headerHeight?: number;
  maxHeight?: number | string;
  onRowClick?: (row: any) => void;
}

/**
 * Performance-optimized data table using virtualization for handling large datasets
 * This component only renders the rows that are visible in the viewport,
 * significantly improving performance with large datasets.
 */
const VirtualizedDataTable: React.FC<VirtualizedDataTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  defaultSortBy,
  defaultSortDirection = "asc",
  rowHeight = 53,
  headerHeight = 56,
  maxHeight = 600,
  onRowClick,
}) => {
  const theme = useTheme();

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    defaultSortDirection
  );

  // Handle sort request
  const handleSort = (columnId: string) => {
    const isAsc = sortBy === columnId && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(columnId);
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortBy, sortDirection]);

  // Render row
  const rowRenderer = useCallback(
    ({ index, style }: ListRowProps) => {
      const row = sortedData[index];
      return (
        <div
          key={index}
          style={{
            ...style,
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
            cursor: onRowClick ? "pointer" : "default",
          }}
          onClick={() => onRowClick && onRowClick(row)}
        >
          {columns.map((column) => {
            const value = row[column.id];
            return (
              <div
                key={column.id}
                style={{
                  minWidth: column.minWidth || 100,
                  maxWidth: column.maxWidth,
                  flex: column.maxWidth ? "none" : 1,
                  padding: theme.spacing(1, 2),
                  textAlign: column.align || "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {column.format ? column.format(value) : value}
              </div>
            );
          })}
        </div>
      );
    },
    [sortedData, columns, theme, onRowClick]
  );

  // Loading state
  if (loading) {
    return (
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight }}>
          <Table stickyHeader aria-label="loading table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton animation="wave" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  // Empty state
  if (!data.length) {
    return (
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight }}>
          <Table stickyHeader aria-label="empty table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          </Table>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader aria-label="virtualized table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : "asc"}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>

        {/* Virtualized rows */}
        <div
          style={{
            height: Math.min(
              rowHeight * sortedData.length,
              Number(maxHeight) - headerHeight
            ),
          }}
        >
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                width={width}
                height={Math.min(
                  rowHeight * sortedData.length,
                  Number(maxHeight) - headerHeight
                )}
                rowCount={sortedData.length}
                rowHeight={rowHeight}
                rowRenderer={rowRenderer}
                overscanRowCount={5}
              />
            )}
          </AutoSizer>
        </div>
      </TableContainer>
    </Paper>
  );
};

export default VirtualizedDataTable;
