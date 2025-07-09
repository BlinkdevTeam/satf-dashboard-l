import { Participant } from "../types/participant";

type Props = {
  user: Participant;
  onTimeIn: () => void;
  onTimeOut: () => void;
  onApprove: () => void;
  approving: boolean;
};

export default function UserPreview({
  user,
  onTimeIn,
  onTimeOut,
  onApprove,
  approving,
}: Props) {
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
      {/* Top section */}
      <div className="space-y-4 text-black">
        {/* Avatar + name/email */}
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

        {/* Info fields */}
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
              className="bg-[#3EAD35] text-white px-4 py-1 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={!user.approved}
            >
              Time In
            </button>
            <button
              onClick={onTimeOut}
              className="bg-[#EF1748] text-white px-4 py-1 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={!user.approved}
            >
              Time Out
            </button>
          </div>
        )}
      </div>

      {/* Bottom Approve Button */}
      {!user.approved && (
        <div className="py-4">
          <div className="h-[36px]">
            {approving ? (
              <div className={`loader ${randomColorClass} mx-auto my-4`} />
            ) : (
              <button
                onClick={onApprove}
                className="bg-[#0035E6] text-white px-4 py-1 rounded w-full cursor-pointer"
              >
                Approve
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
