import type { SelectWithdrawalAccount } from "@repo/core/database/types";
import { useRouter, useParams } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteWithdrawalAccountOnServer } from "../server";

type WithdrawalAccountsTableProps = {
  accounts: SelectWithdrawalAccount[];
};

const getAccountTypeLabel = (accountType: string) => {
  switch (accountType) {
    case "mobile_money":
      return "Mobile Money";
    case "ghipss":
      return "Bank Account";
    default:
      return accountType;
  }
};

const getAccountTypeBadgeVariant = (accountType: string): "default" | "secondary" | "outline" => {
  switch (accountType) {
    case "mobile_money":
      return "default";
    case "ghipss":
      return "secondary";
    default:
      return "outline";
  }
};

const maskAccountNumber = (accountNumber: string) => {
  if (accountNumber.length <= 4) return accountNumber;
  return "*".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
};

const formatDate = (date: Date | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export function WithdrawalAccountsTable({ accounts }: WithdrawalAccountsTableProps) {
  const columns: ColumnDef<SelectWithdrawalAccount>[] = [
    {
      accessorKey: "accountType",
      header: "Account Type",
      cell: ({ row }) => (
        <Badge variant={getAccountTypeBadgeVariant(row.getValue("accountType") as string)}>
          {getAccountTypeLabel(row.getValue("accountType") as string)}
        </Badge>
      ),
      meta: {
        className: "min-w-[130px] sm:min-w-[150px]",
      },
    },
    {
      accessorKey: "mobileMoneyProvider",
      header: "Provider/Bank",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("mobileMoneyProvider") || "Bank Account"}</span>
      ),
      meta: {
        className: "min-w-[150px] sm:min-w-[180px]",
      },
    },
    {
      accessorKey: "accountNumber",
      header: "Account Number",
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {maskAccountNumber(row.getValue("accountNumber"))}
        </span>
      ),
      meta: {
        className: "hidden sm:table-cell min-w-[150px]",
      },
    },
    {
      id: "accountName",
      header: "Account Name",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.name || row.original.accountName || "N/A"}
        </span>
      ),
      meta: {
        className: "hidden md:table-cell min-w-[200px]",
      },
    },
    {
      accessorKey: "createdAt",
      header: "Added",
      cell: ({ row }) => (
        <time className="text-sm text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </time>
      ),
      meta: {
        className: "hidden lg:table-cell min-w-[120px]",
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <AccountActionsDialog
          accountId={row.original.id}
          accountName={row.original.name || row.original.accountName || "Account"}
        />
      ),
      meta: {
        className: "w-[60px]",
      },
    },
  ];

  return (
    <div className="overflow-x-auto rounded-md border">
      <DataTable columns={columns} data={accounts} emptyMessage="No withdrawal accounts found." />
    </div>
  );
}

type AccountActionsDialogProps = {
  accountId: string;
  accountName: string;
};

function AccountActionsDialog({ accountId, accountName }: AccountActionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const params = useParams({ from: "/o/$orgId/finance" });

  const handleDelete = async () => {
    setIsDeleting(true);

    const result = await deleteWithdrawalAccountOnServer({
      data: {
        organizationId: params.orgId,
        accountId,
      },
    });

    if (result.success) {
      setOpen(false);
      router.invalidate();
    }

    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Withdrawal Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove "{accountName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Removing..." : "Remove Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
