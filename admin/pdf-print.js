window.YizhuPrint=function(rec){
 const data=rec&&rec.draft_json;
 if(rec.review_status!=="approved"||data.status!=="approved"||String(data.approved_revision)!==String(data.edit_revision||0)||data.sections.length!==6)throw Error("报告未批准或版本不符");
 const paper=document.createElement("article");paper.className="report-paper";paper.id="pdf-paper";
 const add=(tag,value,parent)=>{const n=document.createElement(tag);n.textContent=String(value);(parent||paper).append(n);return n};
 add("h1","青少年心智成长报告");add("p","家长阅读版 · 已批准 · 模拟案例");
 add("p","成长层级："+data.assessment_level+"　　批准版本："+data.approved_revision);
 const quotes={"02":"成绩记录孩子学会了什么，心智成长让我们看见孩子正在成为怎样的人。","03":"AI时代，心智为王。","05":"教育不只是让孩子学会知识，更是帮助孩子认识自己。"};
 for(let i=0;i<6;i++){const s=data.sections[i];if(s.number!==String(i+1).padStart(2,"0"))throw Error("章节顺序不符");const sec=document.createElement("section");paper.append(sec);add("h2",s.number+"｜"+s.title,sec);for(const raw of s.paragraphs||[])for(const p of String(raw).split(/\n\n+/))if(p.trim())add("p",p.trim(),sec);if(quotes[s.number])add("blockquote",quotes[s.number],sec)}
 add("p","开发模拟报告，仅用于排版测试，不能向真实学生家长交付。");
 document.body.append(paper);document.body.classList.add("printing-report");
 const cleanup=()=>{document.body.classList.remove("printing-report");paper.remove();window.removeEventListener("afterprint",cleanup)};
 window.addEventListener("afterprint",cleanup);
 window.print();
};