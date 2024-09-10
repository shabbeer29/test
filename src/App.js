import './App.css';

import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, VirtualScroll } from '@syncfusion/ej2-react-grids';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { getTradeData } from './data';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function App() {
    let grid;
    let isDataBound = true;
    let updateButton;
    let clearButton;
    let feedDelayInput;
    let timerID;
    let initial = true;
    const load = function (args) {
        this.on('data-ready', () => {
            if (initial) {
                document.getElementById('update1')?.click();
                initial = false;
                feedDelayInput.element.addEventListener('keypress', (e) => {
                    if (e && e.key === 'Enter' && feedDelayInput.element.parentElement.classList.contains('e-input-focus')) {
                        feedDelayInput.value = parseInt(feedDelayInput.element.value);
                        feedDelayInput.focusOut();
                        updateButton.element.click();
                    }
                });
            }
        });
        this.on('destroy', function () {
            if (timerID) {
                clearInterval(timerID);
                timerID = undefined;
            }
        });
    };
    const queryCellInfo = (args) => {
        if (args.column?.field === 'NetIncome') {
            if (args.data['Net'] < 0) {
                args.cell?.classList.remove('e-increase');
                args.cell?.classList.add('e-decrease');
            }
            else if (args.data['Net'] > 0) {
                args.cell?.classList.remove('e-decrease');
                args.cell?.classList.add('e-increase');
            }
        }
        else if (args.column?.field === 'Change') {
            if (args.data['Change'] < 0) {
                updateCellDetails(args.cell, 'below-0');
            }
            else {
                updateCellDetails(args.cell, 'above-0');
            }
        }
        else if (args.column?.field === 'Net') {
            if (args.data['Net'] < 0) {
                updateCellDetails(args.cell, 'below-0');
            }
            else {
                updateCellDetails(args.cell, 'above-0');
            }
        }
        else if (isDataBound) {
            if (args.column?.field === 'Rating') {
                args.cell.innerHTML = '';
                const span = document.createElement('span');
                const span2 = document.createElement('span');
                if (args.data['Change'] === 0) {
                    customizeRatingCell(span, span2, ['e-icons', 'e-intermediate-state-2', 'neutral', 'ic', 'side-space'], 'neutral', 'Neutral');
                }
                else if (args.data['Change'] < -2 && args.data['Net'] < 0) {
                    customizeRatingCell(span, span2, ['e-icons', 'e-negc', 'e-chevron-down-double', 'below-0', 'ic', 'side-space'], 'below-0', 'Strongly Sell');
                }
                else if (args.data['Net'] < 0) {
                    customizeRatingCell(span, span2, ['e-icons', 'e-negc', 'e-chevron-down', 'below-0', 'ic', 'side-space'], 'below-0', 'Sell');
                }
                else if (args.data['Change'] > 5 && args.data['Net'] > 10) {
                    customizeRatingCell(span, span2, ['e-icons', 'e-posc', 'e-chevron-up-double', 'above-0', 'ic', 'side-space'], 'above-0', 'Strongly Buy');
                }
                else {
                    customizeRatingCell(span, span2, ['e-icons', 'e-posc', 'e-chevron-up', 'above-0', 'ic', 'side-space'], 'above-0', 'Buy');
                }
                args.cell.appendChild(span);
                args.cell.appendChild(span2);
            }
        }
        isDataBound = true;
    };
    const customizeRatingCell = (span1, span2, span1_class, span2_class, span2_text) => {
        span1_class.forEach((item) => span1.classList.add(item));
        span2.classList.add(span2_class);
        span2.innerText = span2_text;
    };
    const updateCellDetails = (cell, className) => {
        const div = document.createElement('div');
        const span1 = document.createElement('span');
        span1.classList.add('rowcell-left');
        div.classList.add(className);
        span1.innerHTML = cell.innerHTML;
        cell.innerHTML = '';
        div.appendChild(span1);
        cell.appendChild(div);
    };
    const updateCellValues = () => {
        let oldValue;
        let newValue;
        for (let i = 0; grid && i < grid?.currentViewData.length; i++) {
            if (grid?.currentViewData[i] === undefined) {
                return;
            }
            let num = Math.floor(Math.random() * 99) + 1;
            num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
            oldValue = grid?.currentViewData[i]['Net'];
            if (i % 2 === 0) {
                num = num * 0.25;
            }
            else if (i % 3 === 0) {
                num = num * 0.83;
            }
            else if (i % 5 === 0) {
                num = num * 0.79;
            }
            else if (i % 4 === 0) {
                num = num * 0.42;
            }
            else {
                num = num * 0.51;
            }
            isDataBound = true;
            grid?.setCellValue(grid?.currentViewData[i]['id'], 'Net', parseFloat(num.toFixed(2)));
            isDataBound = true;
            newValue = parseFloat((grid?.currentViewData[i]['Net'] - oldValue).toString().substring(0, 2));
            grid?.setCellValue(grid?.currentViewData[i]['id'], 'Change', parseFloat(newValue.toFixed(2)));
            isDataBound = true;
            const ratingValue = grid?.currentViewData[i]['Net'] < 0 ? 'Sell' : 'Buy';
            grid?.setCellValue(grid?.currentViewData[i]['id'], 'Rating', ratingValue);
            const val = num + newValue;
            grid?.setCellValue(grid?.currentViewData[i]['id'], 'NetIncome', val);
        }
    };
    const data = getTradeData;
    const updateClick = () => {
        if (!timerID) {
            updateButton.disabled = true;
            feedDelayInput.enabled = false;
            clearButton.disabled = false;
            timerID = setInterval(updateCellValues, feedDelayInput.value);
        }
    };
    const clearClick = () => {
        if (timerID) {
            updateButton.disabled = false;
            feedDelayInput.enabled = true;
            clearButton.disabled = true;
            clearInterval(timerID);
            timerID = undefined;
        }
    };
    return (
        <div className='control-pane'>
              <div className='control-section row'>
                  /*<div style={{ marginBottom: '10px', display: 'none' }}>
                      <label style={{ display: 'inline-block', fontSize: '14px', paddingLeft: '5px' }}>
                          Feed Delay(ms):
                      </label>
                      <NumericTextBoxComponent format="N0" value={1000} min={10} max={5000} step={1} width={'150px'} style={{ marginLeft: '7px' }} ref={(scope) => {
              feedDelayInput = scope;
          }} aria-label="Feed delay"/>
                      <ButtonComponent id="update1" ref={(scope) => {
              updateButton = scope;
          }} onClick={updateClick} style={{ marginLeft: '10px' }}>
                          Start Data Update
                      </ButtonComponent>
                      <ButtonComponent id="clear" ref={(scope) => {
              clearButton = scope;
          }} onClick={clearClick} style={{ marginLeft: '10px' }}>
                          Stop Data Update
                      </ButtonComponent>
                  </div>*/
                  <GridComponent id="livestream" dataSource={data} enableVirtualization={false} enableVirtualMaskRow={false} enableHover={false} ref={(g) => {
              grid = g;
          }} allowSelection={false} queryCellInfo={queryCellInfo} load={load}>
                      <ColumnsDirective>
                          <ColumnDirective field="id" headerText="ID" isPrimaryKey={true} visible={false}/>
                          <ColumnDirective field="CountryCode" headerText="Ticker" />
                          <ColumnDirective field="Change" headerText="Change % 1D" format="N0" textAlign="Right"/>
                          <ColumnDirective field="Net" headerText="Net" format="C2" type="number" textAlign="Right"/>
                          <ColumnDirective field="Rating" headerText="Technical Rating 1D"/>
                          <ColumnDirective field="NetIncome" headerText="Net Income" format="C2" type="number" textAlign="Right"/>
                          <ColumnDirective field="Sector" headerText="Sector"/>
                          <ColumnDirective field="EmployeeCount" headerText="Employee Count" textAlign="Right"/>
                      </ColumnsDirective>
                      <Inject services={[VirtualScroll]}/>
                  </GridComponent>
              </div>
          </div>
    );
}
export default App;

const root = createRoot(document.getElementById('root'));
root.render(<App />);