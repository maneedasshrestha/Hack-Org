import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Iconify } from '@/components/iconify';
import { Label } from '@/components/label';



// ----------------------------------------------------------------------

export type ParticipantStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ParticipantProps = {
  id: string;
  name: string;
  email: string;
  githubUsername: string;
  avatarUrl: string;
  registeredAt: string;
  status: ParticipantStatus;
};

// Keep backward compatibility
export type UserProps = ParticipantProps;

type UserTableRowProps = {
  row: ParticipantProps;
  selected: boolean;
  onSelectRow: () => void;
  onStatusChange?: (id: string, status: ParticipantStatus) => void;
};

export function UserTableRow({ row, selected, onSelectRow, onStatusChange }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const getStatusColor = (status: ParticipantStatus): 'warning' | 'success' | 'error' => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusChange = (newStatus: ParticipantStatus) => {
    if (onStatusChange) {
      onStatusChange(row.id, newStatus);
    }
    handleClosePopover();
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar alt={row.name} src={row.avatarUrl} />
            <Box>
              <Typography variant="subtitle2">{row.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {row.githubUsername && `@${row.githubUsername}`}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell>{row.email}</TableCell>

        <TableCell>{row.githubUsername ? `@${row.githubUsername}` : '-'}</TableCell>

        <TableCell>{formatDate(row.registeredAt)}</TableCell>

        <TableCell>
          <Label color={getStatusColor(row.status)}>{row.status}</Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={() => handleStatusChange('APPROVED')}>
            <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
            Approve
          </MenuItem>

          <MenuItem onClick={() => handleStatusChange('REJECTED')} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Reject
          </MenuItem>

          <MenuItem onClick={() => handleStatusChange('PENDING')}>
            <Iconify icon="solar:pen-bold" sx={{ color: 'warning.main' }} />
            Set Pending
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
