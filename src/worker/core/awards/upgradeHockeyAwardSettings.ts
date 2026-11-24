import {
	defaultAwards,
	defaultAwardsHockey,
} from "../../../common/defaultGameAttributes.ts";
import type { GameAttributesLeague } from "../../../common/types.ts";
import { g } from "../../util/index.ts";
import setGameAttributes from "../league/setGameAttributes.ts";

const OLD_ALL_FORMULA = "ps";
const OLD_DPOY_FORMULA = "tk / 25 + hit / 25 + dps";

// Bring award settings in existing hockey leagues up to the current defaults (10 All-League teams, NHL-style formulas). Only touches settings that still match the old defaults, so custom edits are preserved.
export const upgradeHockeyAwardSettings = async () => {
	if (__SPORT !== "hockey") {
		return;
	}

	const awards = g.get("awards");
	if (!awards) {
		return;
	}

	let changed = false;
	const newAwards: GameAttributesLeague["awards"] = awards.map((award) => {
		if (award.shortName === "ALL" && award.numTeams !== undefined) {
			const upgraded = { ...award };
			if (award.numTeams < defaultAwards.all.numTeams) {
				upgraded.numTeams = defaultAwards.all.numTeams;
				changed = true;
			}
			if (
				award.formula === OLD_ALL_FORMULA &&
				award.formulaByPos === undefined
			) {
				upgraded.formula = defaultAwards.all.formula;
				upgraded.formulaByPos = defaultAwards.all.formulaByPos;
				changed = true;
			}
			return upgraded;
		}

		if (
			award.shortName === "ALR" &&
			award.numTeams !== undefined &&
			award.formula === OLD_ALL_FORMULA &&
			award.formulaByPos === undefined
		) {
			changed = true;
			return {
				...award,
				formula: defaultAwards.alr.formula,
				formulaByPos: defaultAwards.alr.formulaByPos,
			};
		}

		if (
			award.shortName === "DPOY" &&
			award.numTeams === undefined &&
			award.formula === OLD_DPOY_FORMULA &&
			award.formulaByPos === undefined
		) {
			changed = true;
			return {
				...award,
				...defaultAwardsHockey.dpoy,
			};
		}

		return award;
	});

	if (changed) {
		await setGameAttributes({ awards: newAwards });
	}
};
