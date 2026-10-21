import { getMissedPercentage } from '../utils/rollCall';

const HIGH_ABSENCE_THRESHOLD = 8.0;

function StatTile({ label, value, valueClass = "text-slate-100", detail }) {
  return (
    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
      <span className="block text-[11px] font-medium text-slate-500 uppercase">{label}</span>
      <span className={`text-lg font-bold block mt-0.5 ${valueClass}`}>{value}</span>
      <span className="text-[11px] text-slate-500">{detail}</span>
    </div>
  );
}

export function MemberOverviewStats({ politician }) {
  const { rollCallVotes, metrics, sentimentStats } = politician;
  const missedPercentage = getMissedPercentage(rollCallVotes);

  const attendanceTile = missedPercentage != null ? (
    <StatTile
      label="Attendance"
      value={`${(100 - missedPercentage).toFixed(1)}%`}
      valueClass={missedPercentage > HIGH_ABSENCE_THRESHOLD ? "text-amber-400" : "text-emerald-400"}
      detail={`${rollCallVotes.missedVotes ?? 0} of ${rollCallVotes.totalVotes ?? 0} missed`}
    />
  ) : (
    <StatTile label="Attendance" value="N/A" detail="No vote data" />
  );

  const { approve, disapprove, neutral } = sentimentStats;
  const totalVotes = approve + disapprove + neutral;

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
        119th Congress Overview
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        {attendanceTile}
        <StatTile
          label="Pass Rate"
          value={metrics.passRate == null ? "N/A" : `${metrics.passRate}%`}
          detail={`${metrics.sponsoredCount} sponsored`}
        />
        <StatTile
          label="Community"
          value={totalVotes > 0 ? `${Math.round((approve / totalVotes) * 100)}%` : "N/A"}
          valueClass="text-cyan-400"
          detail={`${totalVotes} votes`}
        />
      </div>
    </section>
  );
}
