"use strict";

/*
  Ambient calendar media library

  Current repository structure:
    calendar/ocean/  -> 海之日 / day of the sea
    calendar/cloud/  -> 云之日 / day of clouds
    calendar/lake/   -> 湖之日 / day of the lake
    calendar/sky/    -> 天之日 / day of the sky

  The homepage loads only the clip assigned to the selected date.
  The date itself is used as the seed, so refreshing the page does not change
  today's clip and revisiting an older date returns to the same clip.

  Files are currently numbered 1.webm, 2.webm, ...
  When more clips are added later, keep the numbering continuous and only
  update the count below.
*/

(function () {
  function numberedSeries(folder, count, names) {
    var entries = [];

    for (var i = 1; i <= count; i += 1) {
      var number = String(i).padStart(2, "0");

      entries.push({
        src: "./calendar/" + folder + "/" + i + ".webm",
        title: {
          zh: names.zh + " " + number,
          en: names.en + " " + number,
          ja: names.ja + " " + number
        }
      });
    }

    return entries;
  }

  window.AMBIENT_LIBRARY = {
    // The calendar system calls this category `sea`; its files live in /ocean/.
    sea: numberedSeries("ocean", 3, {
      zh: "海面记录",
      en: "sea record",
      ja: "海の記録"
    }),

    cloud: numberedSeries("cloud", 1, {
      zh: "云层记录",
      en: "cloud record",
      ja: "雲の記録"
    }),

    lake: numberedSeries("lake", 10, {
      zh: "湖面记录",
      en: "lake record",
      ja: "湖の記録"
    }),

    sky: numberedSeries("sky", 7, {
      zh: "天空记录",
      en: "sky record",
      ja: "空の記録"
    })
  };
})();
