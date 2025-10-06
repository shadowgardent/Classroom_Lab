import type { ClassroomMember } from '../types';

interface MemberCardProps {
  member: ClassroomMember;
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="card flex flex-col gap-3 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">{member.full_name}</h3>
        <p className="text-xs text-slate-500">{member.email}</p>
      </div>
      <dl className="grid grid-cols-1 gap-2 text-sm text-slate-600">
        {member.student_id && (
          <div>
            <dt className="font-medium text-slate-500">รหัสนักศึกษา</dt>
            <dd>{member.student_id}</dd>
          </div>
        )}
        {member.class_year && (
          <div>
            <dt className="font-medium text-slate-500">ชั้นปี</dt>
            <dd>{member.class_year}</dd>
          </div>
        )}
        {member.company?.name_th && (
          <div>
            <dt className="font-medium text-slate-500">สถานประกอบการ</dt>
            <dd>{member.company.name_th}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}