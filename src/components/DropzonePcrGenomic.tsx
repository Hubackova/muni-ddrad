// @ts-nocheck
import React from "react";
import Dropzone from "./Dropzone";
import * as Papa from "papaparse";

const parseCSV = async (file: any) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (json: any) => {
        resolve(json);
      },
      error: function (err: any, reason: any) {
        reject({ err, reason });
      },
    });
  });
};

const DropzonePcrGenomic: React.FC = ({ importData }) => {
  const handleDrop = async (acceptedFiles: any) => {
    const data: any = await parseCSV(acceptedFiles[0]);

    const finalData =
      // const jsonData = data.data.map((row: any) => {
      //   const { stepDuration, stepId, ...rest } = row;
      //   const restArr = Object.entries(rest);
      //   const outputsNum = parseInt(restArr.slice(-1)[0][0].slice(7, 8));

      //   let outputs = [];
      //   for (let i = 1; i <= outputsNum; i++) {
      //     const entries = restArr.filter((item) =>
      //       item[0].includes(`output.${i}`)
      //     );
      //     const obj = Object.fromEntries(entries);
      //     let stages = [];
      //     const stagesObj = entries.filter((item) => item[0].includes(`stage`));
      //     const stagesObjArr = Object.entries(stagesObj);
      //     const stagesNum = stagesObjArr.length / 2;
      //     for (let s = 1; s <= stagesNum; s++) {
      //       const newStageObj: any = { stageId: s };
      //       newStageObj.property = obj[`output.${i}.stage.${s}.property`];
      //       newStageObj.plug = obj[`output.${i}.stage.${s}.plug`];
      //       stages.push(newStageObj);
      //     }

      //     const newObj: any = {};
      //     newObj.outputId = obj[`output.${i}.outputId`];
      //     newObj.elementId = parseInt((obj as any)[`output.${i}.elementId`]);
      //     newObj.totalGain = parseInt((obj as any)[`output.${i}.totalGain`]);
      //     newObj.stages = stages;
      //     outputs.push(newObj);
      //   }

      //   const newRow = {
      //     stepDuration: parseInt(row.stepDuration, 10),
      //     stepId: parseInt(row.stepId, 10),
      //     outputs,
      //   };

      //   return newRow;
      // });

      // const jsonDataUpdated = jsonData.filter((row: any) => row.stepId);
      importData(data.data);
  };

  return <Dropzone onDropSuccess={handleDrop} label="drag&drop CSV" />;
};

export default DropzonePcrGenomic;
