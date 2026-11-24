const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pretty=value=>String(value||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export const CENTER_LABELS={head:'Head',ajna:'Ajna',throat:'Throat',g:'G / Identity',sacral:'Sacral',spleen:'Spleen',solar_plexus:'Solar Plexus',ego:'Heart / Ego',root:'Root'};
const authorityText={
  emotional:'This tradition emphasizes allowing feelings to change over time before treating a decision as settled.',
  sacral:'This tradition associates decisions with an immediate felt response to the choices actually present.',
  splenic:'This tradition emphasizes brief, immediate intuition.',
  ego_manifested:'This tradition emphasizes recognizing personal wants and the commitments a person is willing to make.',
  ego_projected:'This tradition connects personal willingness with the relationships and invitations involved in a decision.',
  self_projected:'This tradition emphasizes hearing one’s own direction while talking a choice through.',
  environmental:'This tradition emphasizes conversation and the influence of the setting when reflecting on a choice.',
  lunar:'This tradition emphasizes observing changes over time and across different circumstances.'
};
const lineThemes={
  1:['Investigator','learning details and developing a dependable understanding'],
  2:['Hermit','private time, familiar abilities and being drawn into interaction'],
  3:['Experimenter','learning from practical attempts and adjusting after mistakes'],
  4:['Connector','friendship, trust and opportunities through relationships'],
  5:['Problem solver','practical solutions and the expectations other people bring'],
  6:['Role model','learning from experience, observing and later sharing an example']
};
export function describeBirthChart(chart) {
  if(!chart)return null;
  const hd=chart.humanDesign;
  const [first,second]=hd.profile.split('/');
  const profileName=lineThemes[first][0]+' / '+lineThemes[second][0];
  const facts=[
    ['Western Sun sign',chart.western.sun.name],['Western Moon sign',chart.western.moon.name],
    ['Human Design type',hd.typeName],['Authority',hd.authorityName],
    ['Profile',hd.profile+' · '+profileName],['Definition',pretty(hd.definition)]
  ];
  const details=[
    {title:'What authority means here',text:authorityText[hd.authority]+' This is a Human Design interpretation, offered as a reflection on decision habits.'},
    {title:'Your profile’s two themes',text:'The first profile line concerns '+lineThemes[first][1]+'. The second concerns '+lineThemes[second][1]+'. Consider which descriptions fit your experience and which do not.'},
    {title:'Reading the centers',text:'Human Design calls a center defined when a complete activated channel connects it to another center. The tradition interprets definition as a consistent theme and undefined centers as more responsive to circumstances. These are symbolic chart categories, not tests of organs or measured personality traits.'}
  ];
  return {title:'Your calculated birth chart',
    note:(chart.precision==='approximate-time'?'Calculated using an approximate birth time.':'Calculated using the birth time you entered.')+' The Western profile includes Sun and Moon signs. Human Design includes type, authority, profile, centers and channels.',
    facts,details,warnings:[...chart.warnings],
    centers:hd.definedCenters.map(id=>CENTER_LABELS[id]).join(', ')||'None',
    channels:hd.channels.map(channel=>channel.id).join(', ')||'None',
    activations:hd.activations.personality.map(row=>({body:pretty(row.body),personality:row.gate+'.'+row.line,design:(()=>{const match=hd.activations.design.find(item=>item.body===row.body);return match.gate+'.'+match.line;})()})),
    sources:[
      {title:'Jovian Archive: authority interpretations',url:'https://jovianarchive.com/pages/what-is-inner-authority-in-human-design'},
      {title:'Jovian Archive: the six profile lines',url:'https://jovianarchive.com/pages/the-6-lines-of-the-hexagram-in-human-design'},
      {title:'Jovian Archive: the nine centers',url:'https://jovianarchive.com/pages/the-nine-centers-of-the-bodygraph-in-human-design'},
      {title:'Calculation engine, methods and precision',url:'https://github.com/domalhambra/hd-chart-engine'}
    ]
  };
}

function bodygraph(chart) {
  const points={head:[220,35],ajna:[220,105],throat:[220,175],g:[220,255],ego:[350,255],spleen:[80,345],solar_plexus:[360,345],sacral:[220,345],root:[220,435]};
  const defined=new Set(chart.humanDesign.definedCenters);
  const pairs=[...new Set(chart.humanDesign.channels.map(channel=>[...channel.centers].sort().join('|')))];
  const lines=pairs.map(pair=>{
    const [a,b]=pair.split('|'),[x1,y1]=points[a],[x2,y2]=points[b];
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#288171" stroke-width="6"/>';
  }).join('');
  const nodes=Object.entries(points).map(([id,[x,y]])=>{
    const active=defined.has(id);
    return '<g><title>'+escape(CENTER_LABELS[id])+': '+(active?'defined':'undefined')+'</title><rect x="'+(x-57)+'" y="'+(y-23)+'" width="114" height="46" rx="13" fill="'+(active?'#175e55':'#f4f7f9')+'" stroke="'+(active?'#175e55':'#9caeb9')+'" stroke-width="2"/><text x="'+x+'" y="'+(y+5)+'" text-anchor="middle" fill="'+(active?'#ffffff':'#253f50')+'" font-family="system-ui,sans-serif" font-size="14">'+escape(CENTER_LABELS[id])+'</text></g>';
  }).join('');
  return '<figure class="bodygraph"><svg viewBox="0 0 440 475" role="img" aria-label="Calculated Human Design centers and defined connections">'+lines+nodes+'</svg><figcaption>Filled centers are defined in this chart. Lines show defined connections. The table lists the individual gate pairs.</figcaption></figure>';
}

export function renderBirthChart(chart) {
  const info=describeBirthChart(chart);
  if(!info)return '';
  return '<section class="calculated-chart" aria-label="Calculated birth chart"><h3>'+escape(info.title)+'</h3><p>'+escape(info.note)+'</p><dl class="chart-facts">'+info.facts.map(([label,value])=>'<div><dt>'+escape(label)+'</dt><dd>'+escape(value)+'</dd></div>').join('')+'</dl>'+
    (info.warnings.length?'<aside class="chart-warning"><h4>Calculation notes</h4><ul>'+info.warnings.map(text=>'<li>'+escape(text)+'</li>').join('')+'</ul></aside>':'')+
    '<details><summary>Explore the chart and what its terms mean</summary><div class="chart-explanation">'+bodygraph(chart)+'<div>'+info.details.map(item=>'<h4>'+escape(item.title)+'</h4><p>'+escape(item.text)+'</p>').join('')+'</div></div><p><strong>Defined centers:</strong> '+escape(info.centers)+'</p><p><strong>Defined channels:</strong> '+escape(info.channels)+'</p><div class="table-scroll"><table><caption>Planetary activations · gate.line</caption><thead><tr><th>Body</th><th>Personality</th><th>Design</th></tr></thead><tbody>'+info.activations.map(row=>'<tr><th scope="row">'+escape(row.body)+'</th><td>'+escape(row.personality)+'</td><td>'+escape(row.design)+'</td></tr>').join('')+'</tbody></table></div><p class="small">Personality uses the birth moment. Design uses the earlier moment when the Sun was 88 degrees before its birth position. The report does not calculate a DreamRave sleeping chart, ascendant, houses or a full Chinese Four Pillars chart.</p><ul class="source-list">'+info.sources.map(source=>'<li><a href="'+source.url+'" target="_blank" rel="noopener noreferrer">'+escape(source.title)+'</a></li>').join('')+'</ul></details></section>';
}
