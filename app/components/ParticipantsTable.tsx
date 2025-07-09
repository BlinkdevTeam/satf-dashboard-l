import { useState } from "react";
import { Participant } from "../types/participant";

type Props = {
  data: Participant[];
  onSelect: (user: Participant) => void;
  selectedUser: Participant | null;
};

type SortKey = "name" | "email" | "company" | "designation";
type SortOrder = "asc" | "desc";

export default function ParticipantsTable({
  data,
  onSelect,
  selectedUser,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const sortedData = [...data].sort((a, b) => {
    let aValue: string = "";
    let bValue: string = "";

    if (sortKey === "name") {
      aValue = `${a.first_name_upper} ${a.last_name_upper}`;
      bValue = `${b.first_name_upper} ${b.last_name_upper}`;
    } else {
      aValue = (a[sortKey] || "").toString();
      bValue = (b[sortKey] || "").toString();
    }

    return sortOrder === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const AscIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M19 16H5L12 5L19 16Z" fill="#1D1B20" />
    </svg>
  );

  const DescIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 8L19 8L12 19L5 8Z" fill="#1D1B20" />
    </svg>
  );

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? <AscIcon /> : <DescIcon />;
  };

  return (
    <div className="overflow-y-auto max-h-[80vh] border rounded text-black">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th
              className="p-2 text-left cursor-pointer"
              onClick={() => toggleSort("name")}
            >
              <div className="flex items-center gap-1">
                Name {sortIndicator("name")}
              </div>
            </th>
            <th
              className="p-2 text-left cursor-pointer"
              onClick={() => toggleSort("email")}
            >
              <div className="flex items-center gap-1">
                Email {sortIndicator("email")}
              </div>
            </th>
            <th
              className="p-2 text-left cursor-pointer"
              onClick={() => toggleSort("company")}
            >
              <div className="flex items-center gap-1">
                Company {sortIndicator("company")}
              </div>
            </th>
            <th
              className="p-2 text-left cursor-pointer"
              onClick={() => toggleSort("designation")}
            >
              <div className="flex items-center gap-1">
                Designation {sortIndicator("designation")}
              </div>
            </th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {sortedData.map((user) => {
            const isActive = selectedUser?.id === user.id;

            return (
              <tr
                key={user.id}
                className={`cursor-pointer transition-colors duration-100 ${
                  isActive
                    ? "bg-[#00072C] text-white"
                    : "odd:bg-white even:bg-gray-100 hover:bg-gray-200 text-black"
                }`}
                onClick={() => onSelect(user)}
              >
                <td className="p-2">{`${user.first_name_upper} ${user.last_name_upper}`}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.company}</td>
                <td className="p-2">{user.designation}</td>
                <td className="p-2">
                  {user.rejected ? (
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold text-[#EF1748] bg-red-100 rounded">
                      Rejected
                    </span>
                  ) : user.approved ? (
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold text-[#3EAD35] bg-green-100 rounded">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
