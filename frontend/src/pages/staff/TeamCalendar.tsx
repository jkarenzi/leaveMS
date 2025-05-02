import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { FaFilter, FaUser, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { EventContentArg, EventInput, EventMountArg } from '@fullcalendar/core';

// Type definitions
interface TeamMember {
  id: string;
  name: string;
  department: string;
  avatar: string;
}

interface LeaveColorScheme {
  bg: string;
  text: string;
}

interface LeaveEvent extends EventInput {
  id: string;
  userId: string;
  title: string;
  start: string;
  end: string;
  leaveType: string;
  extendedProps: {
    employeeName: string;
    avatar: string;
    department: string;
    userId?: string;
    type?: string;
  };
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

// Mock data for team members
const teamMembers: TeamMember[] = [
  { id: 'user1', name: 'John Doe', department: 'Engineering', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 'user2', name: 'Jane Smith', department: 'Engineering', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 'user3', name: 'Robert Johnson', department: 'Engineering', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 'user4', name: 'Emily Davis', department: 'Finance', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: 'user5', name: 'Michael Wilson', department: 'Marketing', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

// Mock data for leave types with colors
const leaveTypeColors: Record<string, LeaveColorScheme> = {
  'Annual': { bg: '#4CAF50', text: 'white' },
  'Sick': { bg: '#F44336', text: 'white' },
  'Compassionate': { bg: '#9C27B0', text: 'white' },
  'Maternity': { bg: '#E91E63', text: 'white' }
};

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

// Mock data for team leaves
const generateTeamLeaves = (): LeaveEvent[] => {
  const leaves: LeaveEvent[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'John Doe - Annual Leave',
      start: '2025-05-05',
      end: '2025-05-09',
      leaveType: 'Annual',
      extendedProps: {
        employeeName: 'John Doe',
        avatar: teamMembers[0].avatar,
        department: teamMembers[0].department,
        userId: 'user1'
      }
    },
    {
      id: '2',
      userId: 'user2',
      title: 'Jane Smith - Sick Leave',
      start: '2025-05-07',
      end: '2025-05-08',
      leaveType: 'Sick',
      extendedProps: {
        employeeName: 'Jane Smith',
        avatar: teamMembers[1].avatar,
        department: teamMembers[1].department,
        userId: 'user2'
      }
    },
    {
      id: '3',
      userId: 'user3',
      title: 'Robert Johnson - Compassionate Leave',
      start: '2025-05-15',
      end: '2025-05-18',
      leaveType: 'Compassionate',
      extendedProps: {
        employeeName: 'Robert Johnson',
        avatar: teamMembers[2].avatar,
        department: teamMembers[2].department,
        userId: 'user3'
      }
    },
    {
      id: '4',
      userId: 'user4',
      title: 'Emily Davis - Maternity Leave',
      start: '2025-06-01',
      end: '2025-08-31',
      leaveType: 'Maternity',
      extendedProps: {
        employeeName: 'Emily Davis',
        avatar: teamMembers[3].avatar,
        department: teamMembers[3].department,
        userId: 'user4'
      }
    },
    {
      id: '5',
      userId: 'user5',
      title: 'Michael Wilson - Annual Leave',
      start: '2025-04-28',
      end: '2025-05-02',
      leaveType: 'Annual',
      extendedProps: {
        employeeName: 'Michael Wilson',
        avatar: teamMembers[4].avatar,
        department: teamMembers[4].department,
        userId: 'user5'
      }
    }
  ];
  
  return leaves;
};

const TeamCalendar: React.FC = () => {
  // State for filters
  const [showMyLeaves, setShowMyLeaves] = useState<boolean>(true);
  const [showTeamLeaves, setShowTeamLeaves] = useState<boolean>(true);
  const [showHolidays, setShowHolidays] = useState<boolean>(true);
  const [department, setDepartment] = useState<string>("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");
  
  // Current user ID (will come from auth in the real app)
  const currentUserId = 'user1'; 
  
  // Get all departments from team members
  const departments = ['all', ...Array.from(new Set(teamMembers.map(member => member.department)))];
  
  // Get all leave types
  const leaveTypes = ['all', ...Object.keys(leaveTypeColors)];
  
  // Generate team leaves
  const teamLeaves = generateTeamLeaves();
  
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
    
    // Add team leaves if filter is on
    if (showTeamLeaves || showMyLeaves) {
      const filteredLeaves = teamLeaves.filter(leave => {
        // Department filter
        const departmentMatch = department === 'all' || leave.extendedProps.department === department;
        
        // Leave type filter
        const leaveTypeMatch = leaveTypeFilter === 'all' || leave.leaveType === leaveTypeFilter;
        
        // My leaves filter
        const isMyLeave = leave.userId === currentUserId;
        
        return departmentMatch && leaveTypeMatch && (showTeamLeaves || (showMyLeaves && isMyLeave));
      });
      
      // Map leaves to calendar events with proper styling
      const formattedLeaves = filteredLeaves.map(leave => {
        const color = leaveTypeColors[leave.leaveType];
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
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            
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
                    <div>${new Date(info.event.start!).toLocaleDateString()} - ${new Date(info.event.end || info.event.start!).toLocaleDateString()}</div>
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
      </div>
      
      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-medium mb-2">Legend</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(leaveTypeColors).map(([type, colors]) => (
            <div key={type} className="flex items-center">
              <span 
                className="w-4 h-4 rounded-sm mr-2"
                style={{ backgroundColor: colors.bg }}
              ></span>
              <span className="text-sm">{type} Leave</span>
            </div>
          ))}
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-sm mr-2 bg-amber-100 border border-amber-300"></span>
            <span className="text-sm">Public Holiday</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;