import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { FaFilter, FaUser, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { EventContentArg, EventInput, EventMountArg } from '@fullcalendar/core';
import { ClipLoader } from 'react-spinners';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { getAllLeaveApplications } from '../../redux/actions/leaveApplicationActions';

// Type definitions
interface LeaveColorScheme {
  bg: string;
  text: string;
}

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

// Tailwind color palette
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

// Rwanda public holidays for 2025
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

const TeamCalendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leaveApplications, fetchingApplications } = useAppSelector(state => state.leave);
  const { user } = useAppSelector(state => state.user);

  // State for filters
  const [showMyLeaves, setShowMyLeaves] = useState<boolean>(true);
  const [showTeamLeaves, setShowTeamLeaves] = useState<boolean>(true);
  const [showHolidays, setShowHolidays] = useState<boolean>(true);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");
  
  // Current user ID and department from auth
  const currentUserId = user?.id;
  const currentUserDepartment = user?.department;

  // Fetch all leave applications on component mount
  useEffect(() => {
    dispatch(getAllLeaveApplications());
  }, [dispatch]);

  // Generate a hash code from a string (for deterministic color assignment)
  const getHashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Filter leave applications to only show approved applications from the same department
  const teamLeaveApplications = useMemo(() => {
    return leaveApplications.filter(app => 
      app.status === 'Approved' && 
      app.employee?.department === currentUserDepartment
    );
  }, [leaveApplications, currentUserDepartment]);

  // Generate dynamic color mapping for all leave types
  const leaveTypeColors = useMemo(() => {
    // Get all unique leave types from applications
    const leaveTypes = Array.from(
      new Set(teamLeaveApplications.map(app => app.leaveType?.name))
    ).filter(Boolean) as string[];
    
    // Create a map of leave types to colors
    const colorMap: Record<string, LeaveColorScheme> = {};
    
    // Assign a unique color to each leave type based on its name
    leaveTypes.forEach(leaveType => {
      if (leaveType) {
        // Use hash of leave type name to pick a color
        const hashCode = getHashCode(leaveType);
        const colorIndex = hashCode % COLOR_PALETTE.length;
        colorMap[leaveType] = COLOR_PALETTE[colorIndex];
      }
    });
    
    return colorMap;
  }, [teamLeaveApplications]);

  // Get all leave types from applications
  const leaveTypes = useMemo(() => {
    return ['all', ...Object.keys(leaveTypeColors)];
  }, [leaveTypeColors]);

  // Transform leave applications to calendar events
  const teamLeaves = useMemo(() => {
    return teamLeaveApplications.map(app => {
      // Add one day to the end date to make it inclusive
      const endDate = new Date(app.endDate);
      endDate.setDate(endDate.getDate() + 1);
      return {
        id: app.id,
        userId: app.employeeId,
        title: `${app.employee?.name || 'Employee'} - ${app.leaveType.name} Leave`,
        start: app.startDate,
        end: endDate.toISOString().split('T')[0],
        leaveType: app.leaveType.name,
        extendedProps: {
          employeeName: app.employee?.name || 'Employee',
          avatar: app.employee?.avatarUrl || `https://ui-avatars.com/api/?name=${app.employee?.name || 'U'}`,
          department: app.employee?.department || 'Unknown',
          userId: app.employeeId
        }
      }
    });
  }, [teamLeaveApplications]);

  // Format holidays for the calendar
  const formattedHolidays: EventInput[] = rwandaHolidays.map(holiday => ({
    ...holiday,
    display: 'background',
    backgroundColor: '#FFC107',
    classNames: ['holiday-event'],
    extendedProps: {
      type: 'holiday'
    }
  }));

  // Filter events based on selected filters
  const getFilteredEvents = (): EventInput[] => {
    let events: EventInput[] = [];
    
    // Add team leaves and my leaves based on filter
    if (showTeamLeaves || showMyLeaves) {
      const filteredLeaves = teamLeaves.filter(leave => {
        // Leave type filter
        const leaveTypeMatch = leaveTypeFilter === 'all' || leave.leaveType === leaveTypeFilter;
        
        // My leaves filter
        const isMyLeave = leave.userId === currentUserId;
        
        return leaveTypeMatch && (showTeamLeaves || (showMyLeaves && isMyLeave));
      });
      
      // Map leaves to calendar events with proper styling
      const formattedLeaves = filteredLeaves.map(leave => {
        // Use the dynamic color mapping - fall back to a default color if type is not found
        const color = leaveTypeColors[leave.leaveType] || COLOR_PALETTE[0];
        return {
          ...leave,
          backgroundColor: color.bg,
          borderColor: color.bg,
          textColor: color.text,
          classNames: ['leave-event']
        };
      });
      
      events = [...events, ...formattedLeaves];
    }
    
    // Add holidays if filter is on
    if (showHolidays) {
      events = [...events, ...formattedHolidays];
    }
    
    return events;
  };

  // Custom rendering for event content
  const renderEventContent = (eventInfo: EventContentArg) => {
    if (eventInfo.event.extendedProps?.type === 'holiday') {
      return (
        <div className="holiday-event p-1">
          <span className="font-medium text-amber-800">{eventInfo.event.title}</span>
        </div>
      );
    }
    
    const isMyEvent = eventInfo.event.extendedProps?.userId === currentUserId;
    
    return (
      <div className="leave-event p-1">
        <div className="flex items-center">
          <img 
            src={eventInfo.event.extendedProps?.avatar} 
            alt={eventInfo.event.extendedProps?.employeeName || "Employee"}
            className="w-6 h-6 rounded-full mr-2"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${eventInfo.event.extendedProps?.employeeName || 'User'}`;
            }}
          />
          <div>
            <div className="text-sm font-semibold">
              {isMyEvent ? 'You' : eventInfo.event.extendedProps?.employeeName}
            </div>
            <div className="text-xs">{eventInfo.event.title.split(' - ')[1]}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Team Calendar</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="myLeaves"
                checked={showMyLeaves}
                onChange={() => setShowMyLeaves(!showMyLeaves)}
                className="mr-2"
              />
              <label htmlFor="myLeaves" className="flex items-center">
                <FaUser className="mr-1 text-blue-500" />
                <span>My Leaves</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="teamLeaves"
                checked={showTeamLeaves}
                onChange={() => setShowTeamLeaves(!showTeamLeaves)}
                className="mr-2"
              />
              <label htmlFor="teamLeaves" className="flex items-center">
                <FaUsers className="mr-1 text-green-500" />
                <span>Team Leaves</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="holidays"
                checked={showHolidays}
                onChange={() => setShowHolidays(!showHolidays)}
                className="mr-2"
              />
              <label htmlFor="holidays" className="flex items-center">
                <FaCalendarAlt className="mr-1 text-amber-500" />
                <span>Public Holidays</span>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-2 items-center">
            <FaFilter className="text-gray-400" />
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {leaveTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Leave Types' : `${type} Leave`}
                </option>
              ))}
            </select>
          </div>
        </div>
        
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
              events={getFilteredEvents()}
              eventContent={renderEventContent}
              height="auto"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
              firstDay={1} // Start week on Monday
              eventDisplay="block"
              displayEventEnd={true}
              eventDidMount={(info: EventMountArg) => {
                // Add tooltip
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
      
      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-medium mb-4">Leave Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(leaveTypeColors).map(([type, colors]) => (
            <div key={type} className="flex items-center">
              <div 
                className="w-5 h-5 rounded-md mr-2 flex-shrink-0 border border-gray-200"
                style={{ backgroundColor: colors.bg }}
              ></div>
              <span className="text-sm truncate">{type}</span>
            </div>
          ))}
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-md mr-2 flex-shrink-0 bg-amber-100 border border-amber-300"></div>
            <span className="text-sm">Public Holiday</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;