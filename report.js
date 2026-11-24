import { assessPattern, activeQuestions, observationQuestions, breathingOptions } from './assessment.js';
import { buildGuideReport, guideLearningSections, guideSources, formatSleepMinutes } from './guide-model.js';
import { getTraditionReport, getPatternEcho } from './traditions.js';

function printable(text) {
  return String(text).replace(/[–—−]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/½/g, '1/2').replace(/•/g, '-').replace(/…/g, '...')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e\n]/g, '');
}
export async function createSleepPdf(answers, selection = {}, diary = [], name = '', PDFLib = globalThis.PDFLib) {
  if (!PDFLib) throw new Error('The PDF generator is still loading. Try again in a moment.');
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const doc = await PDFDocument.create();
  // Stable bytes permit retrying the same email with the provider's idempotency key.
  doc.setTitle('Cloud Forest Sleep Patterns Report');
  doc.setAuthor('Cloud Forest');
  doc.setCreator('Cloud Forest Sleep Patterns');
  doc.setProducer('Cloud Forest Sleep Patterns');
  doc.setCreationDate(new Date('2026-11-23T00:00:00Z'));
  doc.setModificationDate(new Date('2026-11-23T00:00:00Z'));
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const blue = rgb(.09,.25,.36);
  const ink = rgb(.10,.16,.20);
  const muted = rgb(.32,.39,.44);
  const lineColor = rgb(.82,.87,.90);
  const width = 612;
  const height = 792;
  const margin = 46;
  let page;
  let y;
  function newPage() {
    page = doc.addPage([width,height]);
    y = height - 67;
    page.drawText('CLOUD FOREST  /  SLEEP PATTERNS FIELD GUIDE', {x:margin,y:height-31,size:8,font:bold,color:blue});
    page.drawLine({start:{x:margin,y:height-40},end:{x:width-margin,y:height-40},thickness:.7,color:lineColor});
  }
  function ensure(space) {
    if (y - space < 52) newPage();
  }
  function wrapped(text, font, size, maxWidth) {
    const words = printable(text).trim().split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      if (font.widthOfTextAtSize(word,size) > maxWidth) {
        if (line) lines.push(line);
        line = '';
        for (const char of word) {
          if (font.widthOfTextAtSize(line+char,size)>maxWidth) { lines.push(line); line=''; }
          line += char;
        }
      } else {
        const next = line ? line+' '+word : word;
        if (line && font.widthOfTextAtSize(next,size)>maxWidth) {lines.push(line);line=word;}
        else line=next;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
  function write(text, kind='paragraph') {
    if (!text) return;
    const font = ['title','heading'].includes(kind) ? bold : regular;
    const size = kind === 'title' ? 23 : kind === 'heading' ? 13 : 10.5;
    const leading = size+4.5;
    const indent = kind==='bullet'?10:0;
    const lines=wrapped((kind==='bullet'?'- ':'')+text,font,size,width-2*margin-indent);
    if (kind==='heading') {y-=9;ensure(leading*2+18);}
    if (kind==='title') ensure(leading*lines.length+24);
    for (const line of lines) {
      ensure(leading);
      page.drawText(line,{x:margin+indent,y,size,font,color:kind==='heading'||kind==='title'?blue:ink});
      y-=leading;
    }
    y-=kind==='bullet'?4:9;
  }
  newPage();
  const assessment=assessPattern(answers);
  const questions=[...activeQuestions(answers),...observationQuestions,{id:'apneaSigns',q:'Sleep observations you selected',opts:breathingOptions}];
  const records=buildGuideReport(answers,assessment,questions);
  for (const item of records) {
    write(item.text,item.kind);
    if (item.kind==='title' && name.trim()) write('Prepared for '+name.trim());
  }
  newPage();
  write('Understanding the sleep behind the pattern','title');
  const learningSections=guideLearningSections.filter(item=>['stages','two-processes','changing'].includes(item.id));
  for (const section of learningSections) {
    write(section.title,'heading');
    section.paragraphs.forEach(text=>write(text));
    write('Field Guide pages '+section.guideSource.pages.join(', '));
  }
  write('Further reading','heading');
  for(const id of [...new Set(learningSections.flatMap(section=>section.sourceIds))]) {
    const source=guideSources[id];
    if(source)write(source.title+' - '+source.url);
  }
  if (Object.values(selection).some(Boolean)) {
    newPage();
    write('Your optional tradition reflections','title');
    for (const section of getTraditionReport(selection)) {
      write(section.title,'heading');
      section.paragraphs.forEach(text=>write(text));
      write('Field Guide pages '+section.sourcePages.join(', '));
    }
    const echo=getPatternEcho(assessment.key);
    if (echo) {
      write('The guide’s comparison for your pattern','heading');
      for (const [key,value] of Object.entries(echo)) {
        if (['western','chinese','humanDesign'].includes(key) && value) write(String(value));
      }
      write('Field Guide page 23');
    }
  }
  newPage();
  write(diary.length?'Your sleep diary':'A two-week sleep record','title');
  write('For split sleep, add the time asleep in both main stretches. Keep naps separate, then add them to the day’s total. Use your own time zone when recording dates.');
  if (diary.length) {
    for (const row of [...diary].sort((a,b)=>a.date.localeCompare(b.date))) {
      write(row.date,'heading');
      write('Main sleep '+(row.mainMinutes ? formatSleepMinutes(row.mainMinutes) : '0 minutes')+
        '. Naps '+(row.napMinutes ? formatSleepMinutes(row.napMinutes) : '0 minutes')+
        '. Total '+formatSleepMinutes(row.mainMinutes+row.napMinutes)+'.');
      if(row.energy) write('How the day felt - '+({rested:'Rested',mixed:'Mixed',sleepy:'Sleepy'}[row.energy]||row.energy));
    }
    const average=Math.round(diary.reduce((sum,row)=>sum+row.mainMinutes+row.napMinutes,0)/diary.length);
    write('Average across '+diary.length+' recorded days - '+formatSleepMinutes(average),'heading');
  } else {
    const cols=[margin,margin+27,margin+103,margin+218,margin+319,width-margin];
    const labels=['Day','Date','Main sleep','Naps','Total / alertness'];
    ensure(440);
    let top=y-9;
    page.drawRectangle({x:margin,y:top-23,width:width-2*margin,height:23,color:rgb(.92,.95,.97)});
    labels.forEach((label,i)=>page.drawText(label,{x:cols[i]+4,y:top-16,size:9,font:bold,color:blue}));
    for(let i=0;i<14;i++){
      const rowY=top-23-i*25;
      page.drawLine({start:{x:margin,y:rowY},end:{x:width-margin,y:rowY},thickness:.6,color:lineColor});
      page.drawText(String(i+1),{x:margin+6,y:rowY-17,size:9,font:regular,color:ink});
    }
    page.drawLine({start:{x:margin,y:top-23-350},end:{x:width-margin,y:top-23-350},thickness:.6,color:lineColor});
    y=top-23-350-20;
  }
  write('Review your record','heading');
  write('Compare workdays with days off. Look at total sleep, daytime alertness, and any long periods awake. Use the two-week observation plan earlier in this report to choose one manageable adjustment. Bring your record to a healthcare visit if sleep problems persist.');
  const pages=doc.getPages();
  pages.forEach((sheet,i)=>{
    sheet.drawLine({start:{x:margin,y:39},end:{x:width-margin,y:39},thickness:.6,color:lineColor});
    sheet.drawText('Cloud Forest | Educational self-assessment',{x:margin,y:25,size:8,font:regular,color:muted});
    sheet.drawText((i+1)+' / '+pages.length,{x:width-margin-31,y:25,size:8,font:regular,color:muted});
  });
  return await doc.save({useObjectStreams:true});
}
