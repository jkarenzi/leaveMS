import React, { useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventInput, EventMountArg, EventContentArg } from '@fullcalendar/core';
import { UserWithLeaveBalances } from '../../types/LeaveBalance';
import { useAppSelector } from '../../redux/hooks';


interface LeaveColorScheme {
  bg: string;
  text: string;
}

// Constants for calendar colors - matches AdminCalendar
const COLOR_PALETTE: LeaveColorScheme[] = [
  { bg: '#E53935', text: 'white' },  // Bright Red
  { bg: '#43A047', text: 'white' },  // Bright Green
  { bg: '#1E88E5', text: 'white' },  // Bright Blue
  { bg: '#8E24AA', text: 'white' },  // Purple
  { bg: '#FB8C00', text: 'white' },  // Orange
  { bg: '#00ACC1', text: 'white' },  // Cyan
  { bg: '#3949AB', text: 'white' },  // Indigo
  { bg: '#D81B60', text: 'white' },  // Pink
  { bg: '#5D4037', text: 'white' },  // Brown
  { bg: '#546E7A', text: 'white' },  // Blue Grey
  { bg: '#F57F17', text: 'white' },  // Dark Yellow
  { bg: '#00897B', text: 'white' },  // Teal
  { bg: '#7CB342', text: 'white' },  // Light Green
  { bg: '#039BE5', text: 'white' },  // Light Blue
  { bg: '#C62828', text: 'white' },  // Dark Red
  { bg: '#6A1B9A', text: 'white' },  // Dark Purple
  { bg: '#2E7D32', text: 'white' },  // Dark Green
  { bg: '#283593', text: 'white' },  // Dark Blue
  { bg: '#EF6C00', text: 'white' },  // Dark Orange
  { bg: '#00695C', text: 'white' }   // Dark Teal
];

interface HolidayEvent extends EventInput {
  title: string;
  start: string;
  allDay: boolean;
  display?: string;
  backgroundColor?: string;
  classNames?: string[];
  extendedProps: {
    type: string;
  };
}

// Rwanda public holidays for 2025 - matches AdminCalendar
const rwandaHolidays: HolidayEvent[] = [
  { title: 'New Year\'s Day', start: '2025-01-01', allDay: true, extendedProps: { type: 'holiday' } },
  { title: 'Heroes\' Day', start: '2025-02-01', allDay: true, extendedProps: { type: 'holiday' } },
  { title: 'International Women\'s Day', start: '2025-03-08', allDay: true, extendedProps: { type: 'holiday' } },
  { title: 'Tutsi Genocide Memorial Day', start: '2025-04-07', allDay: true, extendedProps: { type: 'holiday' } },
  { title: 'Good Friday', start: '2025-04-18', allDay: true, extendedProps: { type: 'holiday' } }, // Dates may vary
  { title: 'Easter Monday', start: '2025-04-21', allDay: true, extendedProps: { type: 'holiday' } }, // Dates may vary
  { title: 'Labor Day', start: '2025-05-01', allDay: true, extendedProps: { type: 'holiday' } },
  { title: 'Liberation Day', start: '2025-07-04', allDay: true, extendedProps: { type: 'holiday' } },
  { title: 'Umuganura Day', start: '2025-08-01', allDay: true, extendedProps: { type: 'holiday' } },
  { title: 'Assumption Day', start: '2025-08-15', allDay: true, extendedProps: { type: 'holiday' } },
  { title: 'Christmas Day', start: '2025-12-25', allDay: true, extendedProps: { type: 'holiday' } },
  { title: 'Boxing Day', start: '2025-12-26', allDay: true, extendedProps: { type: 'holiday' } },
];

interface EmployeeCalendarModalProps {
  employee: UserWithLeaveBalances;
  onClose: () => void;
}

const EmployeeCalendarModal: React.FC<EmployeeCalendarModalProps> = ({ 
  employee, 
  onClose 
}) => {
  const { leaveApplications, fetchingApplications } = useAppSelector(state => state.leave);

  // Generate a hash code from a string (for deterministic color assignment)
  const getHashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  // Map leave types to colors
  const leaveTypeColors = useMemo(() => {
    const colorMap: Record<string, LeaveColorScheme> = {};
    const leaveTypes = [...new Set(leaveApplications.map(app => app.leaveType.name))];
    
    leaveTypes.forEach((leaveType) => {
      if (leaveType) {
        // Use hash of leave type name to pick a color
        const hashCode = getHashCode(leaveType);
        const colorIndex = hashCode % COLOR_PALETTE.length;
        colorMap[leaveType] = COLOR_PALETTE[colorIndex];
      }
    });
    
    return colorMap;
  }, [leaveApplications]);
  
  // Format holidays for the calendar
  const formattedHolidays = useMemo(() => {
    return rwandaHolidays.map(holiday => ({
      ...holiday,
      display: 'background',
      backgroundColor: '#FFC107',
      classNames: ['holiday-event'],
      extendedProps: {
        type: 'holiday'
      }
    }));
  }, []);

  // Filter events to show only the selected employee's leaves
  const getEmployeeEvents = (employeeId: string): EventInput[] => {
    // let events: EventInput[] = [];
    
    // Get employee leaves
    const employeeLeaves = leaveApplications
      .filter(app => app.employeeId === employeeId && app.status === 'Approved')
      .map(app => {
        const color = leaveTypeColors[app.leaveType.name] || COLOR_PALETTE[0];
        // Add one day to the end date to make it inclusive
        const endDate = new Date(app.endDate);
        endDate.setDate(endDate.getDate() + 1);
        return {
          id: app.id,
          title: `${app.employee?.name || 'Employee'} - ${app.leaveType.name} Leave`,
          start: app.startDate,
          end: endDate.toISOString().split('T')[0],
          backgroundColor: color.bg,
          borderColor: color.bg,
          textColor: color.text,
          classNames: ['leave-event'],
          extendedProps: {
            employeeName: app.employee?.name || 'Employee',
            avatar: app.employee?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (app.employee?.name || 'User'),
            userId: app.employeeId
          }
        };
      });
    
    // Add holidays
    return [...employeeLeaves, ...formattedHolidays];
  };
  
  // Render event content for the calendar
  const renderEventContent = (eventInfo: EventContentArg) => {
    if (eventInfo.event.extendedProps?.type === 'holiday') {
      return (
        <div className="holiday-event p-1">
          <div className="font-medium">{eventInfo.event.title}</div>
        </div>
      );
    }
    
    return (
      <div className="p-1 overflow-hidden">
        <div className="font-medium text-sm truncate">{eventInfo.event.title.split(' - ')[1] || eventInfo.event.title}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] mx-4 flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-medium text-gray-900">
            {employee.name}'s Leave Calendar
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {fetchingApplications ? (
            <div className="flex justify-center items-center py-20">
              <ClipLoader size={40} color="#3B82F6" />
            </div>
          ) : (
            <div className="calendar-wrapper">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,listMonth'
                }}
                events={getEmployeeEvents(employee.id)}
                eventContent={renderEventContent}
                height="auto"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: 'short'
                }}
                firstDay={1}
                eventDisplay="block"
                displayEventEnd={true}
                eventDidMount={(info: EventMountArg) => {
                  // Add tooltip for non-holiday events
                  if (info.event.extendedProps?.type !== 'holiday') {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'calendar-tooltip';
                    tooltip.innerHTML = `
                      <div class="p-2 bg-gray-800 text-white rounded shadow-lg text-xs">
                        <div class="font-bold">${info.event.extendedProps?.employeeName || ''}</div>
                        <div>${info.event.title.split(' - ')[1] || info.event.title}</div>
                        <div>${new Date(info.event.start!).toLocaleDateString()} - ${new Date(new Date(info.event.end!).getTime() - 86400000).toLocaleDateString()}</div>
                      </div>
                    `;
                    
                    const element = info.el;
                    element.addEventListener('mouseover', () => {
                      document.body.appendChild(tooltip);
                      const rect = element.getBoundingClientRect();
                      tooltip.style.position = 'absolute';
                      tooltip.style.top = rect.bottom + window.scrollY + 5 + 'px';
                      tooltip.style.left = rect.left + window.scrollX + 'px';
                      tooltip.style.zIndex = '10000';
                    });
                    
                    element.addEventListener('mouseout', () => {
                      if (document.body.contains(tooltip)) {
                        document.body.removeChild(tooltip);
                      }
                    });
                  }
                }}
              />
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-4 py-3 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCalendarModal;