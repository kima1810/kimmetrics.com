const Database = require('../node_modules/better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, "../databases/NHL_Clutch.db"), { readonly: true });

function nhlClutch() {
    const query = `
        SELECT 
            Player, Team, 
            "Total GP", "SV%", "GSAx/60", "TOI in Clutch",
            "SV% in Clutch", "GSAx/60 in Clutch",
            ROUND("SV% in Clutch" - "SV%", 3) AS "SV% Difference in Clutch",
            ROUND("GSAx/60 in Clutch" - "GSAx/60", 3) AS "GSAx/60 Difference in Clutch",
            ROUND(
                0.45 * "GSAx/60 in Clutch" + 0.55 * ("GSAx/60 in Clutch" - "GSAx/60"), 3
            ) AS "Clutch Score"
        FROM (
            SELECT
        gr.Player, gr.Team,
        gr.GP + CASE WHEN gp.TOI IS NOT NULL THEN gp.GP ELSE 0 END AS "Total GP",
        ROUND(
            (gr."SV%" * (gr.TOI / (gr.TOI + CASE WHEN gp.TOI IS NOT NULL THEN gp.TOI ELSE 0 END))) +
            CASE WHEN gp.TOI IS NOT NULL THEN (gp."SV%" * (gp.TOI / (gr.TOI + gp.TOI))) ELSE 0 END, 3
        ) AS "SV%",
        ROUND(
            ((gr.GSAx / NULLIF(gr.TOI, 0)) * (gr.TOI / (gr.TOI + CASE WHEN gp.TOI IS NOT NULL THEN gp.TOI ELSE 0 END)) * 60) +
            CASE WHEN gp.TOI IS NOT NULL THEN ((gp.GSAx / NULLIF(gp.TOI, 0)) * (gp.TOI / (gr.TOI + gp.TOI)) * 60) ELSE 0 END, 2
        ) AS "GSAx/60",
        ROUND(
            (CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
            CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
            CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
            CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END), 2
        ) AS "TOI in Clutch",
        ROUND(
            CASE WHEN grt.TOI IS NOT NULL THEN grt."SV%" * (grt.TOI /
                (CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
                 CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
                 CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
                 CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END)) ELSE 0 END +
            CASE WHEN grl.TOI IS NOT NULL THEN grl."SV%" * (grl.TOI /
                (CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
                 CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
                 CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
                 CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END)) ELSE 0 END +
            CASE WHEN gpt.TOI IS NOT NULL THEN gpt."SV%" * (gpt.TOI /
                (CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
                 CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
                 CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
                 CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END)) ELSE 0 END +
            CASE WHEN gpl.TOI IS NOT NULL THEN gpl."SV%" * (gpl.TOI /
                (CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
                 CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
                 CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
                 CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END)) ELSE 0 END, 3
        ) AS "SV% in Clutch",
        ROUND(
            CASE WHEN grt.TOI IS NOT NULL THEN (grt.GSAx / NULLIF(grt.TOI, 0) * 60) * (grt.TOI /
                (CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
                 CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
                 CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
                 CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END)) ELSE 0 END +
            CASE WHEN grl.TOI IS NOT NULL THEN (grl.GSAx / NULLIF(grl.TOI, 0) * 60) * (grl.TOI /
                (CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
                 CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
                 CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
                 CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END)) ELSE 0 END +
            CASE WHEN gpt.TOI IS NOT NULL THEN (gpt.GSAx / NULLIF(gpt.TOI, 0) * 60) * (gpt.TOI /
                (CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
                 CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
                 CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
                 CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END)) ELSE 0 END +
            CASE WHEN gpl.TOI IS NOT NULL THEN (gpl.GSAx / NULLIF(gpl.TOI, 0) * 60) * (gpl.TOI /
                (CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
                 CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
                 CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
                 CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END)) ELSE 0 END, 2
        ) AS "GSAx/60 in Clutch"
    FROM Goalie_Active_Reg gr
    LEFT JOIN Goalie_Active_Playoff gp ON gr.Player = gp.Player
    LEFT JOIN Goalie_Active_Reg_Up1 grl ON gr.Player = grl.Player
    LEFT JOIN Goalie_Active_Reg_Tied grt ON gr.Player = grt.Player
    LEFT JOIN Goalie_Active_Playoff_Up1 gpl ON gr.Player = gpl.Player
    LEFT JOIN Goalie_Active_Playoff_Tied gpt ON gr.Player = gpt.Player
    WHERE 
        gr.GP + CASE WHEN gp.TOI IS NOT NULL THEN gp.GP ELSE 0 END > 19
        AND (
            CASE WHEN grt.TOI IS NOT NULL THEN grt.TOI ELSE 0 END +
            CASE WHEN grl.TOI IS NOT NULL THEN grl.TOI ELSE 0 END +
            CASE WHEN gpt.TOI IS NOT NULL THEN gpt.TOI ELSE 0 END +
            CASE WHEN gpl.TOI IS NOT NULL THEN gpl.TOI ELSE 0 END
        ) > 0
        ) subquery
        ORDER BY "Clutch Score" DESC
    `;
    return db.prepare(query).all();
}

module.exports = { nhlClutch };
