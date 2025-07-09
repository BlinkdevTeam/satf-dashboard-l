import { useState } from "react";
import { Participant } from "../types/participant";

type Props = {
  user: Participant;
  onTimeIn: () => void;
  onTimeOut: () => void;
  onApprove: () => void;
  onReject: () => void;
  approving: boolean;
};

export default function UserPreview({
  user,
  onTimeIn,
  onTimeOut,
  onApprove,
  onReject,
  approving,
}: Props) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleConfirmApprove = () => {
    setShowApprovalModal(false);
    onApprove();
  };
  const initials =
    (user.first_name_upper?.charAt(0) || "") +
    (user.last_name_upper?.charAt(0) || "");

  const avatarColors = [
    "bg-[#00072C]",
    "bg-[#0035E6]",
    "bg-[#3EAD35]",
    "bg-[#FEC205]",
    "bg-[#EF1748]",
  ];

  const getColorClass = (key: string) => {
    const sum = key
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[sum % avatarColors.length];
  };

  const avatarClass = getColorClass(
    user.first_name_upper + user.last_name_upper
  );

  const loaderColors = [
    "loader-blue",
    "loader-green",
    "loader-yellow",
    "loader-red",
  ];
  const randomColorClass =
    loaderColors[Math.floor(Math.random() * loaderColors.length)];

  const isOnlineSource =
    user.source === "satf_participant_online_17" ||
    user.source === "satf_participant_online_24";

  return (
    <div className="flex flex-col justify-between h-full text-sm">
      {/* Top Section */}
      <div className="space-y-4 text-black">
        {/* Avatar and Name */}
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-full ${avatarClass} text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow-md`}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-black">
              {user.first_name_upper} {user.last_name_upper}
            </p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-4">
          <p>
            <strong>Company:</strong> {user.company}
          </p>
          <p>
            <strong>Designation:</strong> {user.designation}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {[
              user.street,
              user.barangay,
              user.city,
              user.province_state,
              user.zip,
            ]
              .filter(Boolean)
              .join(", ") || "—"}
          </p>
          <p>
            <strong>Contact Number:</strong> {user.cellphone}
          </p>

          {!isOnlineSource && (
            <>
              <p>
                <strong>Time In:</strong> {user.formatted_timein || "—"}
              </p>
              <p>
                <strong>Time Out:</strong> {user.formatted_timeout || "—"}
              </p>
            </>
          )}
        </div>

        {/* Time Buttons */}
        {!isOnlineSource && (
          <div className="flex gap-2 w-full">
            <button
              onClick={onTimeIn}
              className="bg-[#3EAD35] text-white px-4 py-1 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!user.approved}
            >
              Time In
            </button>
            <button
              onClick={onTimeOut}
              className="bg-[#EF1748] text-white px-4 py-1 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!user.approved}
            >
              Time Out
            </button>
          </div>
        )}
      </div>

      {/* Approve / Reject Actions */}
      {!user.approved && !user.rejected && (
        <div className="pt-4 flex gap-2">
          {approving ? (
            <div className={`loader ${randomColorClass} mx-auto`} />
          ) : (
            <>
              <button
                onClick={() => setShowApprovalModal(true)}
                className="bg-[#0035E6] text-white px-4 py-1 rounded w-full cursor-pointer"
              >
                Approve
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="bg-[#EF1748] text-white px-4 py-1 rounded w-full cursor-pointer"
              >
                Reject
              </button>
            </>
          )}
        </div>
      )}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-md p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Confirm Approval
            </h2>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to approve{" "}
              <strong>
                {user.first_name_upper} {user.last_name_upper}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-1 bg-[#0035E6] text-white rounded hover:bg-blue-800 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-md p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Confirm Rejection
            </h2>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to reject{" "}
              <strong>
                {user.first_name_upper} {user.last_name_upper}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  onReject();
                }}
                className="px-4 py-1 bg-[#EF1748] text-white rounded hover:bg-red-800 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
