
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/lib/superbase/type";
import { useTaskStore } from "@/app/store/useTask";


interface PriorityData {
  name: Task["priority"];
  svg?: React.ReactNode;
}

const priorityData: PriorityData[] = [
  {
    name: "no priority",
    svg: (
      <svg
        aria-label="No Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        // style="--icon-color: lch(62.6% 1.35 272 / 1);"
      >
        <rect
          x="1.5"
          y="7.25"
          width="3"
          height="1.5"
          rx="0.5"
          opacity="0.9"
        ></rect>
        <rect
          x="6.5"
          y="7.25"
          width="3"
          height="1.5"
          rx="0.5"
          opacity="0.9"
        ></rect>
        <rect
          x="11.5"
          y="7.25"
          width="3"
          height="1.5"
          rx="0.5"
          opacity="0.9"
        ></rect>
      </svg>
    ),
  },
  {
    name: "ugency",
    svg: (
      <svg
        aria-label="Urgent Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        // fill="lch(66% 80 48)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        // style="--icon-color: lch(66% 80 48);"
      >
        <path d="M3 1C1.91067 1 1 1.91067 1 3V13C1 14.0893 1.91067 15 3 15H13C14.0893 15 15 14.0893 15 13V3C15 1.91067 14.0893 1 13 1H3ZM7 4L9 4L8.75391 8.99836H7.25L7 4ZM9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10C8.55228 10 9 10.4477 9 11Z"></path>
      </svg>
    ),
  },
  {
    name: "high",
    svg: (
      <svg
        aria-label="High Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        // style="--icon-color: lch(62.6% 1.35 272 / 1);"
      >
        <rect x="1.5" y="8" width="3" height="6" rx="1"></rect>
        <rect x="6.5" y="5" width="3" height="9" rx="1"></rect>
        <rect x="11.5" y="2" width="3" height="12" rx="1"></rect>
      </svg>
    ),
  },
  {
    name: "medium",
    svg: (
      <svg
        aria-label="Medium Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        // style="--icon-color: lch(62.6% 1.35 272 / 1);"
      >
        <rect x="1.5" y="8" width="3" height="6" rx="1"></rect>
        <rect x="6.5" y="5" width="3" height="9" rx="1"></rect>
        <rect
          x="11.5"
          y="2"
          width="3"
          height="12"
          rx="1"
          fillOpacity="0.4"
        ></rect>
      </svg>
    ),
  },
  {
    name: "low",
    svg: (
      <svg
        aria-label="Low Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        // style="--icon-color: lch(62.6% 1.35 272 / 1);"
      >
        <rect x="1.5" y="8" width="3" height="6" rx="1"></rect>
        <rect
          x="6.5"
          y="5"
          width="3"
          height="9"
          rx="1"
          fillOpacity="0.4"
        ></rect>
        <rect
          x="11.5"
          y="2"
          width="3"
          height="12"
          rx="1"
          fillOpacity="0.4"
        ></rect>
      </svg>
    ),
  },
];

const getPriorityImage = (priority: Task["priority"]) => {
  switch (priority) {
    case "ugency":
      return (
        <svg
          aria-label="Urgent Priority"
          className=""
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="lch(66% 80 48)"
          role="img"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          // style="--icon-color: lch(66% 80 48);"
        >
          <path d="M3 1C1.91067 1 1 1.91067 1 3V13C1 14.0893 1.91067 15 3 15H13C14.0893 15 15 14.0893 15 13V3C15 1.91067 14.0893 1 13 1H3ZM7 4L9 4L8.75391 8.99836H7.25L7 4ZM9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10C8.55228 10 9 10.4477 9 11Z"></path>
        </svg>
      );
    case "high":
      return (
        <svg
          aria-label="High Priority"
          className=""
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="oklch(72.3% 0.219 149.579)"
          role="img"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          // style="--icon-color: lch(62.6% 1.35 272 / 1);"
        >
          <rect x="1.5" y="8" width="3" height="6" rx="1"></rect>
          <rect x="6.5" y="5" width="3" height="9" rx="1"></rect>
          <rect x="11.5" y="2" width="3" height="12" rx="1"></rect>
        </svg>
      );
    case "medium":
      return (
        <svg
          aria-label="Medium Priority"
          className=""
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="oklch(72.3% 0.219 149.579)"
          role="img"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          // style="--icon-color: lch(62.6% 1.35 272 / 1);"
        >
          <rect x="1.5" y="8" width="3" height="6" rx="1"></rect>
          <rect x="6.5" y="5" width="3" height="9" rx="1"></rect>
          <rect
            x="11.5"
            y="2"
            width="3"
            height="12"
            rx="1"
            fillOpacity="0.4"
          ></rect>
        </svg>
      );
    case "low":
      return (
        <svg
          aria-label="Low Priority"
          className=""
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="oklch(72.3% 0.219 149.579)"
          role="img"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          // style="--icon-color: lch(62.6% 1.35 272 / 1);"
        >
          <rect x="1.5" y="8" width="3" height="6" rx="1"></rect>
          <rect
            x="6.5"
            y="5"
            width="3"
            height="9"
            rx="1"
            fillOpacity="0.4"
          ></rect>
          <rect
            x="11.5"
            y="2"
            width="3"
            height="12"
            rx="1"
            fillOpacity="0.4"
          ></rect>
        </svg>
      );
    default:
      return (
        <svg
          aria-label="No Priority"
          className=""
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="lch(62.6% 1.35 272 / 1)"
          role="img"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          // style="--icon-color: lch(62.6% 1.35 272 / 1);"
        >
          <rect
            x="1.5"
            y="7.25"
            width="3"
            height="1.5"
            rx="0.5"
            opacity="0.9"
          ></rect>
          <rect
            x="6.5"
            y="7.25"
            width="3"
            height="1.5"
            rx="0.5"
            opacity="0.9"
          ></rect>
          <rect
            x="11.5"
            y="7.25"
            width="3"
            height="1.5"
            rx="0.5"
            opacity="0.9"
          ></rect>
        </svg>
      );
  }
};

const PriorityCard = ({
  task,
  priority,
}: {
  task: Task;
  priority: Task["priority"];
}) => {
  const handleOptimisticPriority = useTaskStore(
    (state) => state.handleOptimisticPriority
  );
 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="p-1 rounded cursor-pointer text-[10px] tracking-widest"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {getPriorityImage(priority)}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="outline-0 border-none w-[200px]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
        <DropdownMenuSeparator className="bg-cardCB/50" />
        {priorityData.map((data, idx) => (
          <DropdownMenuItem
            key={idx}
            className="text-[12px] tracking-widest text-textNc"
            onClick={(e) => {
              e.stopPropagation();
              handleOptimisticPriority(task.id, data.name);
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span>{data.svg}</span> {data.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PriorityCard;
