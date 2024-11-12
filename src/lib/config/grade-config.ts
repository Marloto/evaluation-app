import { GradeConfig } from "@/lib/types/types";

export const defaultGradeConfig: GradeConfig = {
    thresholds: [
        {
            grade: '1,0',
            text: 'Sehr gut',
            minPercentage: 95,
            color: '#166534',
            bgColor: '#dcfce7'
        },
        {
            grade: '1,3',
            text: 'Sehr gut',
            minPercentage: 90,
            color: '#166534',
            bgColor: '#dcfce7'
        },
        {
            grade: '1,7',
            text: 'Gut',
            minPercentage: 85,
            color: '#15803d',
            bgColor: '#dcfce7'
        },
        {
            grade: '2,0',
            text: 'Gut',
            minPercentage: 80,
            color: '#15803d',
            bgColor: '#dcfce7'
        },
        {
            grade: '2,3',
            text: 'Gut',
            minPercentage: 75,
            color: '#3f6212',
            bgColor: '#ecfccb'
        },
        {
            grade: '2,7',
            text: 'Befriedigend',
            minPercentage: 70,
            color: '#3f6212',
            bgColor: '#ecfccb'
        },
        {
            grade: '3,0',
            text: 'Befriedigend',
            minPercentage: 65,
            color: '#854d0e',
            bgColor: '#fefce8'
        },
        {
            grade: '3,3',
            text: 'Befriedigend',
            minPercentage: 60,
            color: '#854d0e',
            bgColor: '#fefce8'
        },
        {
            grade: '3,7',
            text: 'Ausreichend',
            minPercentage: 55,
            color: '#9a3412',
            bgColor: '#fff7ed'
        },
        {
            grade: '4,0',
            text: 'Ausreichend',
            minPercentage: 50,
            color: '#9a3412',
            bgColor: '#fff7ed'
        },
        {
            grade: '5,0',
            text: 'Nicht ausreichend',
            minPercentage: 0,
            color: '#991b1b',
            bgColor: '#fef2f2'
        }
    ]
};