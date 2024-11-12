import React from 'react';
import { format, isSameDay, eachDayOfInterval, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { getAppointmentColor } from './utils';
import { Appointment, DateRange } from './types';

interface CustomRangeViewProps {
  selectionRange: DateRange;
  appointments: Appointment[];
  onTimeSlotClick: (date: Date, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function CustomRangeView({
  selectionRange,
  appointments,
  onTimeSlotClick,
  onAppointmentClick
}: CustomRangeViewProps) {
  const days = eachDayOfInterval(selectionRange);
  const rangeDuration = differenceInDays(selectionRange.end, selectionRange.start) + 1;

  // Pour les plages > 7 jours, utiliser un affichage similaire au mode mois
  if (rangeDuration > 7) {
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-600">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const dayAppointments = appointments.filter(apt => 
            isSameDay(new Date(apt.time), day)
          );

          return (
            <div
              key={idx}
              className="min-h-[120px] p-2 border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
              onClick={() => onTimeSlotClick(day, '09:00')}
            >
              <div className="font-medium text-sm mb-2">
                {format(day, 'd', { locale: fr })}
              </div>
              
              {dayAppointments.length > 0 && (
                <div className="space-y-1">
                  {/* Afficher un résumé des rendez-vous */}
                  <div className="text-xs text-gray-500">
                    {dayAppointments.length} rendez-vous
                  </div>
                  
                  {/* Barres de progression par type */}
                  {Object.entries(
                    dayAppointments.reduce((acc, apt) => {
                      acc[apt.type] = (acc[apt.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count], index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div
                        className={`h-2 rounded-full ${getAppointmentColor(type, 'confirmé')}`}
                        style={{ 
                          width: `${(count / dayAppointments.length) * 100}%`,
                          minWidth: '20%'
                        }}
                      />
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  ))}

                  {/* Liste des premiers rendez-vous */}
                  <div className="mt-2 space-y-1">
                    {dayAppointments.slice(0, 2).map((apt, i) => (
                      <div
                        key={i}
                        className={`text-xs p-1 rounded truncate ${getAppointmentColor(apt.type, apt.status)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                      >
                        {format(new Date(apt.time), 'HH:mm')} - {apt.patient}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              )}

              {dayAppointments.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Pour les plages ≤ 7 jours, conserver l'affichage détaillé existant
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  return (
    <div className="grid" style={{ gridTemplateColumns: `auto repeat(${days.length}, 1fr)` }}>
      <div className="col-start-2 col-span-full grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map(day => (
          <div key={day.toString()} className="text-center p-2 font-medium">
            {format(day, 'EEE d', { locale: fr })}
          </div>
        ))}
      </div>

      {timeSlots.map(time => (
        <React.Fragment key={time}>
          <div className="text-right pr-4 text-gray-500 text-sm py-2">
            {time}
          </div>
          {days.map(day => {
            const dayAppointments = appointments.filter(
              apt => apt.time.includes(time) && isSameDay(new Date(apt.time), day)
            );

            return (
              <div
                key={day.toString()}
                className="border border-gray-100 p-1 min-h-[60px] relative hover:bg-gray-50"
                onClick={() => onTimeSlotClick(day, time)}
              >
                {dayAppointments.map((apt, i) => (
                  <div
                    key={i}
                    className={`p-1 rounded mb-1 cursor-pointer ${getAppointmentColor(apt.type, apt.status)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                  >
                    <div className="text-xs font-medium truncate">{apt.patient}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}