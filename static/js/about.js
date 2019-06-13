let rate_limiting_subfix = '?client_id=3d032602cc3318f720bf&client_secret=8e7f4a421ce4183bcc4ffb16991942c18cd0c9b6';

$.get("https://api.github.com/users/tosone/repos" + rate_limiting_subfix).then(repos => {
  repos.push({ languages_url: "https://api.github.com/repos/TechStudyGroup/fontend/languages" })
  repos.push({ languages_url: "https://api.github.com/repos/TechStudyGroup/backend-golang/languages" })
  return Promise.all(repos.map(repo => {
    return $.get(repo.languages_url + rate_limiting_subfix).then(language => {
      return Promise.resolve(language);
    });
  }));
}).then(languages => {
  let languageInfos = [];
  for (let language of languages) {
    _.forEach(language, (val, key) => {
      let flag = false;
      for (let i in languageInfos) {
        if (languageInfos[i].lang === key) {
          flag = true;
          languageInfos[i].lines += val;
        }
      }
      if (!flag) {
        languageInfos.push({ lang: key, lines: val });
      }
    });
  }

  let sum = 0;
  for (let item of languageInfos) {
    sum += item.lines;
  }

  languageInfos = _.sortBy(languageInfos, "lines");
  let text = [];
  for (let i = languageInfos.length - 1; i >= 0; i--) {
    let rate = ((languageInfos[i].lines * 100) / sum).toFixed(1);
    if (languageInfos[i].lang == "POV-Ray SDL") {
      continue;
    }
    if (parseInt(rate) > 5) {
      text.push(languageInfos[i].lang);
    }
  }
  $("#language").html(text.join(", "));
}).catch(error => {
  console.log(error);
});
